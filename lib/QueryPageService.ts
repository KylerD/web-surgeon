import { ChatCompletionRequestMessage, OpenAIApi } from "openai";


export class QueryPageService {
  systemContext: string
  unpredictableSafetyMargin: number = 50;

  constructor(private openAI: OpenAIApi, private summaryContext: string, private query: string) {
    this.systemContext = `You are a very enthusiastic "Web Surgeon" who loves to help people make sense of content.
    The content you will be given is a summary of a web page and any relevant sections from the page itself.
    Given the following content, you will answer questions using only that information. If you are unsure,
    you will say "I don't know". 
    
    Content: 
    ${this.summaryContext}
    
    Question: """
    ${this.query}
    """`
  }

  async getAnswer() {
    const systemMsg: ChatCompletionRequestMessage = {
      role: 'system',
      content: this.systemContext
    }

    const completionResponse = await this.openAI.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [systemMsg]
    });

    return completionResponse.data.choices[0].message?.content;
  }
}