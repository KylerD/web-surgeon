import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { HTTPMethod } from '@/models/http/httpMethod'
import { HTTPCode } from '@/models/http/httpCodes'
import { ScalpelService } from '@/lib/ScalpelService';
import { DissectedWebPage } from '@/models/DissectedWebPage';
import { AnalysisResponse } from '@/models/AnalysisResponse';
import { TokenService } from '@/lib/TokenService';

interface ChatCompletionAnalysisResponse {
  summary: string;
  keywords: string[];
}

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

  const summarisationWordLimit = parseInt(process.env.summarisationWordLimit as string);

  const systemContext = `You will behave as a content analysis API.
  You will recieve the content of web pages and analyse them, returning your analysis in a JSON format. 
  You will process the results into a JSON object with the following structure:
  { "summary": "...", "keywords": ["...", "...", "..."] }
  Where "summary" is an overview of the content provided in up to ${summarisationWordLimit} words and "keywords" is an array containing the 3 keywords that best describe the content of the page. 
  Only return responses in this format.`

  const promptContext = `### Content`

  const embeddingTokenLimit = parseInt(process.env.embeddingTokenLimit as string);
  const completionTokenLimit = parseInt(process.env.completionTokenLimit as string);

  const tokenService = new TokenService();
  const scalpel: ScalpelService = new ScalpelService(embeddingTokenLimit, completionTokenLimit, tokenService);

  const unpredictableSafetyMargin = 50;
  const contextMargin =
    tokenService.tokenCount(systemContext + promptContext) +
    summarisationWordLimit +
    unpredictableSafetyMargin;

  const webPage: DissectedWebPage = await scalpel.dissect(url, contextMargin);

  if (!webPage.content) {
    return res.status(HTTPCode.BadRequest).json({ message: 'No content found' });
  }

  const moderationResponse = await openai.createModeration({ input: webPage.summariseableContent });
  const [results] = moderationResponse.data.results;

  if (results.flagged) {
    return res.status(400).json({
      message: 'Content is not suitable for analysis',
      flagged: true,
      categories: results.categories
    });
  }

  const systemMsg: ChatCompletionRequestMessage = {
    role: 'system',
    content: systemContext
  }

  const userMsg: ChatCompletionRequestMessage = {
    role: 'user',
    content: promptContext + ' ' + webPage.summariseableContent
  }

  const completionResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [systemMsg, userMsg]
  });

  const completionContent = completionResponse.data.choices[0].message?.content;

  if (!completionContent) {
    return res.status(500).json({ message: 'No analysis available' });
  }

  try {
    const parsedCompletion: ChatCompletionAnalysisResponse = JSON.parse(completionContent);

    const analysis: AnalysisResponse = {
      overview: parsedCompletion.summary,
      keywords: parsedCompletion.keywords,
      internalLinks: webPage.internalLinks,
      externalLinks: webPage.externalLinks
    }

    return res.status(200).json({ ...analysis });
  } catch (err) {
    console.error('Could not parse response');
    console.info(completionContent);
    return res.status(500).json({ message: 'Something went wrong' });
  }

}


