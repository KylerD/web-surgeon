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
import { ReferenceService } from '@/lib/ReferenceService';
import { AnalysisResponse } from '@/models/AnalysisResponse';


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

  const analysisService = new AnalysisService();
  const webPageAnalysis: AnalysedWebPage = await analysisService.analyseUrl(url);

  if (!webPageAnalysis.content) {
    return res.status(HTTPCode.BadRequest).json({ message: 'No content found' });
  }

  const embeddingTokenLimit = parseInt(process.env.embeddingTokenLimit as string);
  const completionTokenLimit = parseInt(process.env.completionTokenLimit as string);

  const scalpel: ScalpelService = new ScalpelService(embeddingTokenLimit, completionTokenLimit, tokenService);

  const summarisationWordLimit = parseInt(process.env.summarisationWordLimit as string);
  const summarisationService = new SummarisationService(openai, summarisationWordLimit, tokenService);

  const keywordsLimit = parseInt(process.env.keywordsLimit as string);
  const keywordService = new KeywordService(openai, keywordsLimit, tokenService);

  const referencesLimit = parseInt(process.env.referencesLimit as string);
  const referenceService = new ReferenceService(openai, referencesLimit, tokenService);

  const availableSummaryContext = scalpel.getAllowableContextFromContent(webPageAnalysis.content, summarisationService.getContextMargin());
  const availableKeywordsContext = scalpel.getAllowableContextFromContent(webPageAnalysis.content, keywordService.getContextMargin());
  const avialbleReferenceContext = scalpel.getAllowableContextFromContent(webPageAnalysis.content, referenceService.getContextMargin());

  const moderationResponse = await openai.createModeration({ input: availableSummaryContext });
  const [results] = moderationResponse.data.results;

  if (results.flagged) {
    return res.status(400).json({
      message: 'Content is not suitable for analysis',
      flagged: true,
      categories: results.categories
    });
  }

  const [summary, keywords] = await Promise.all([
    summarisationService.getSummary(availableSummaryContext),
    keywordService.getKeywords(availableKeywordsContext)
  ]);

  const analysis: AnalysisResponse = {
    overview: summary,
    keywords: keywords
  }

  return res.status(200).json(analysis);

}

