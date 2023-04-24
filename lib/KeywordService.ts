import { ChatCompletionRequestMessage, OpenAIApi } from "openai";
import { TokenService } from "./TokenService";
import { CompletionService } from "@/models/CompletionService";

export class KeywordService implements CompletionService {
  systemContext: string
  unpredictableSafetyMargin: number = 50;

  constructor(private openAI: OpenAIApi, private keywordLimit: number, private tokenService: TokenService) {
    this.systemContext = `You are a pattern analysis tool.
    You will recieve the content of a web page and return the ${this.keywordLimit} most relevant keywords which describe the content of the web page.
    Only return ${this.keywordLimit} comma seperated keywords e.g. "football, sport, soccer" 
    Do not return any other information`
  }

  getContextMargin(): number {
    return this.tokenService.tokenCount(this.systemContext) +
      this.keywordLimit +
      this.unpredictableSafetyMargin;
  }

  async getKeywords(content: string) {
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

    const completionContent = completionResponse.data.choices[0].message?.content;
    if (!completionContent) {
      return [];
    }

    const keywords = completionContent.split(',').map((keyword) => keyword.trim());

    return keywords;
  }
}