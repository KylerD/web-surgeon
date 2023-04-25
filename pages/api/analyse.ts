import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'
import { HTTPMethod } from '@/models/http/httpMethod'
import { HTTPCode } from '@/models/http/httpCodes'
import { ScalpelService } from '@/lib/ScalpelService';
import { TokenService } from '@/lib/TokenService';
import { AnalysisService } from '@/lib/AnalysisService';
import { AnalysedWebPage } from '@/models/AnalysedWebPage';
import { SummarisationService } from '@/lib/SummarisationService';
import { KeywordService } from '@/lib/KeywordService';
import { AnalysisResponse } from '@/models/AnalysisResponse';
import { EmbeddingService } from '@/lib/EmbeddingService';
import { createClient } from '@supabase/supabase-js';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== HTTPMethod.POST) {
    return res.status(HTTPCode.NotAllowed).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(HTTPCode.BadRequest).json({ message: 'Missing URL' });
  }

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const tokenService = new TokenService();

  try {
    const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);

    const { data } = await supabase.from('page').select().eq('url', url).single();

    if (data) {
      console.info('Using cached analysis for ' + url);
      const cachedAnalysis = data as AnalysisResponse;
      return res.status(HTTPCode.OK).json(cachedAnalysis);
    }

    const analysisService = new AnalysisService();
    const webPageAnalysis: AnalysedWebPage = await analysisService.analyseUrl(url);

    if (!webPageAnalysis.content) {
      console.error('No content found for ' + url);
      return res.status(HTTPCode.BadRequest).json({ message: 'No content found' });
    }

    const completionTokenLimit = parseInt(process.env.completionTokenLimit as string);
    const scalpel: ScalpelService = new ScalpelService(completionTokenLimit, tokenService);

    const summarisationWordLimit = parseInt(process.env.summarisationWordLimit as string);
    const summarisationService = new SummarisationService(openai, summarisationWordLimit, tokenService);

    const keywordsLimit = parseInt(process.env.keywordsLimit as string);
    const keywordService = new KeywordService(openai, keywordsLimit, tokenService);

    const availableSummaryContext = scalpel.getAllowableContextFromContent(
      webPageAnalysis.content, summarisationService.getContextMargin()
    );
    const availableKeywordsContext = scalpel.getAllowableContextFromContent(
      webPageAnalysis.content, keywordService.getContextMargin()
    );

    const moderationResponse = await openai.createModeration({ input: availableSummaryContext });
    const [results] = moderationResponse.data.results;

    if (results.flagged) {
      console.error('URL was suitable for analysis: ' + url + ' - ' + results.categories);

      return res.status(HTTPCode.BadRequest).json({
        message: 'Content is not suitable for analysis',
        flagged: true,
        categories: results.categories
      });
    }

    const embeddingService = new EmbeddingService(openai);

    const [summary, keywords, embeddedSentences] = await Promise.all([
      summarisationService.getSummary(availableSummaryContext),
      keywordService.getKeywords(availableKeywordsContext),
      embeddingService.generateEmbeddings(webPageAnalysis.sentences)
    ]);

    console.info('URL analysed: ' + url);
    console.info('Embedded sentences: ' + embeddedSentences.length);

    const analysis: AnalysisResponse = {
      overview: summary,
      keywords: keywords,
      embeddedSentences: embeddedSentences
    }

    const { error: upsertPageError, data: page } = await supabase
      .from('page')
      .insert({
        url: url,
        overview: analysis.overview,
        keywords: analysis.keywords
      })
      .select()
      .limit(1)
      .single();

    if (upsertPageError) {
      throw upsertPageError;
    }

    for (const embeddedStence of analysis.embeddedSentences) {
      const { error: upsertEmbeddedSentenceError } = await supabase
        .from('page_sentence')
        .insert({
          page_id: page.id,
          content: embeddedStence.sentence,
          embedding: embeddedStence.embedding
        })
        .select()
        .limit(1)
        .single();

      if (upsertEmbeddedSentenceError) {
        throw upsertEmbeddedSentenceError;
      }
    }

    return res.status(HTTPCode.OK).json(analysis);
  } catch (error) {
    console.error(error);
    return res.status(HTTPCode.SomethingWentWrong).json({ message: 'Something went wrong' });
  }
}

