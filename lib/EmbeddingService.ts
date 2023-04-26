import { PageSentence } from "@/models/PageSentence";
import { CreateEmbeddingResponseDataInner, OpenAIApi } from "openai";


export class EmbeddingService {
  constructor(private openAI: OpenAIApi) { }

  async embedQuery(query: string): Promise<number[]> {
    const embeddingResponse = await this.openAI.createEmbedding({
      model: 'text-embedding-ada-002',
      input: query,
    })

    if (embeddingResponse.status !== 200) {
      throw new Error('Failed to generate embeddings')
    }

    const responseData = embeddingResponse.data.data;

    return responseData[0].embedding;
  }

  async generateEmbeddedSentences(sentences: string[]): Promise<PageSentence[]> {
    const embeddingResponse = await this.openAI.createEmbedding({
      model: 'text-embedding-ada-002',
      input: sentences,
    })

    if (embeddingResponse.status !== 200) {
      throw new Error('Failed to generate embeddings')
    }

    const responseData = embeddingResponse.data.data;

    const embeddedSentences = responseData.map((embeddingData: CreateEmbeddingResponseDataInner) => {
      return {
        content: sentences[embeddingData.index],
        embedding: embeddingData.embedding
      }
    });

    return embeddedSentences;
  }
}