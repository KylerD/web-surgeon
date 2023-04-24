import { ChatCompletionRequestMessage, OpenAIApi } from "openai";
import { TokenService } from "./TokenService";
import { CompletionService } from "@/models/CompletionService";


export class SummarisationService implements CompletionService {
  systemContext: string
  unpredictableSafetyMargin: number = 50;

  constructor(private openAI: OpenAIApi, private summaryWordLimit: number, private tokenService: TokenService) {
    this.systemContext = `You are a content summarisation tool.
    You will recieve the content of web pages and summarise the content and purpose of the web page them.
    Summaries can be up to ${this.summaryWordLimit} words long. 
    Do not return any other information.`
  }

  getContextMargin(): number {
    return this.tokenService.tokenCount(this.systemContext) +
      this.summaryWordLimit +
      this.unpredictableSafetyMargin;
  }

  async getSummary(content: string): Promise<string> {
    const systemMsg: ChatCompletionRequestMessage = {
      role: 'system',
      content: this.systemContext
    }

    const userMsg: ChatCompletionRequestMessage = {
      role: 'user',
      content: content
    }

    const completionResponse = await this.openAI.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [systemMsg, userMsg]
    });

    return completionResponse.data.choices[0].message?.content || 'Could not summarise this content';
  }
}