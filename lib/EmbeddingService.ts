import { EmbeddedSentence } from "@/models/EmbeddedSentence";
import { CreateEmbeddingResponseDataInner, OpenAIApi } from "openai";


export class EmbeddingService {
  constructor(private openAI: OpenAIApi) { }

  async generateEmbeddings(sentences: string[]): Promise<EmbeddedSentence[]> {
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
        sentence: sentences[embeddingData.index],
        embedding: embeddingData.embedding
      }
    });

    return embeddedSentences;
  }
}