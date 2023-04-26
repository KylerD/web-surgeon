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
import { InsertPageRequest, Page } from '@/models/Page';
import { EmbeddingService } from '@/lib/EmbeddingService';
import { StorageService } from '@/lib/StorageService';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== HTTPMethod.POST) {
    console.error('Method not allowed');
    return res.status(HTTPCode.NotAllowed).end();
  }

  const url = req.body.url as string;

  if (!url) {
    console.error('Missing request body');
    return res.status(HTTPCode.BadRequest).end();
  }

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const embeddingService = new EmbeddingService(openai);
  const tokenService = new TokenService();
  const storageService = new StorageService();

  try {
    const existingPage: Page | null = await storageService.getPage(url);

    if (existingPage) {
      console.info('Using cached analysis for ' + url);
      return res.status(HTTPCode.OK).json({ reference: existingPage.reference });
    }

    const analysisService = new AnalysisService();
    const webPageAnalysis: AnalysedWebPage = await analysisService.analyseUrl(url);

    if (!webPageAnalysis.content) {
      console.error('No content found for ' + url);
      return res.status(HTTPCode.BadRequest).end();
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

      return res.status(HTTPCode.BadRequest).end();
    }

    const [summary, keywords, embeddedSentences] = await Promise.all([
      summarisationService.getSummary(availableSummaryContext),
      keywordService.getKeywords(availableKeywordsContext),
      embeddingService.generateEmbeddedSentences(webPageAnalysis.sentences)
    ]);

    console.info('URL analysed: ' + url);
    console.info('Embedded sentences: ' + embeddedSentences.length);

    const page: InsertPageRequest = {
      url: url,
      overview: summary,
      keywords: keywords
    }

    const insertedPage: Page = await storageService.insertPage(page);

    await storageService.insertPageSentences(insertedPage.id, embeddedSentences);

    return res.status(HTTPCode.OK).json({ reference: insertedPage.reference });
  } catch (error) {
    console.error(error);
    return res.status(HTTPCode.SomethingWentWrong).end();
  }
}

