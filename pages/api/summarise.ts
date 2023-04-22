import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { HTTPMethod } from '@/models/http/httpMethod'
import { HTTPCode } from '@/models/http/httpCodes'
import { ScalpelService } from '@/lib/ScalpelService';
import { DissectedWebPage } from '@/models/DissectedWebPage';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== HTTPMethod.POST) {
    return res.status(HTTPCode.NotAllowed).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(HTTPCode.BadRequest).json({ message: 'Missing URL' });
  }

  const scalpel: ScalpelService = new ScalpelService();
  const webPage: DissectedWebPage = await scalpel.dissect(url);
  console.log(webPage.links);

  if (!webPage.content) {
    return res.status(HTTPCode.BadRequest).json({ message: 'No content found' });
  }

  const systemContext: ChatCompletionRequestMessage = {
    role: 'system',
    content: `You are a content summarisation tool. Given the following information, provide a summary of the content in up to ${scalpel.getSummaryAllowance()} words. 
    If you are unsure and the information is not clear, say 'Sorry, I don't know how to summarise this content'.`
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  });
  const openai = new OpenAIApi(configuration);

  const prompt: ChatCompletionRequestMessage = {
    role: 'user',
    content: webPage.summariseableContent
  }

  const completionResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [systemContext, prompt]
  });

  const completionContent = completionResponse.data.choices[0].message?.content;

  if (completionContent) {
    return res.status(200).json({ summary: completionContent, links: webPage.links });
  } else {
    return res.status(500).json({ message: 'Something went wrong' });
  }
}


