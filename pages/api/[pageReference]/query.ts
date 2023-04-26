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
import { PageSentence } from '@/models/PageSentence';
import { QueryPageService } from '@/lib/QueryPageService';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const pageReference = req.query.pageReference as string;

  if (method !== HTTPMethod.POST) {
    console.error('Method not allowed');
    return res.status(HTTPCode.NotAllowed).end();
  }

  const query = req.body.query as string;

  if (!query) {
    console.error('Missing request body');
    return res.status(HTTPCode.BadRequest).end();
  }

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const embeddingService = new EmbeddingService(openai);
  const storageService = new StorageService();

  try {
    const page: Page | null = await storageService.getPageByReference(pageReference);

    if (!page) {
      console.error('Page not found');
      return res.status(HTTPCode.NotFound).end();
    }

    const embeddedQuery = await embeddingService.embedQuery(query);
    const matchingSentences: PageSentence[] = await storageService.getMatchingPageSentences(page.id, embeddedQuery);

    const context = page.overview.concat("Relevant sections: ", matchingSentences.map(s => s.content).join('. '));

    const queryPageService = new QueryPageService(
      openai,
      context,
      query
    );

    const answer = await queryPageService.getAnswer();

    return res.status(HTTPCode.OK).json({ answer: answer });

  } catch (error) {
    console.error(error);
    return res.status(HTTPCode.SomethingWentWrong).end();
  }
}

