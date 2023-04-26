import { ChatCompletionRequestMessage, OpenAIApi } from "openai";
import { TokenService } from "./TokenService";
import { CompletionService } from "@/models/CompletionService";

export class KeywordService implements CompletionService {
  systemContext: string
  unpredictableSafetyMargin: number = 50;

  constructor(private openAI: OpenAIApi, private keywordLimit: number, private tokenService: TokenService) {
    this.systemContext = `You are a topic analysis tool that returns the ${this.keywordLimit} most relevant topics of content. The content you will be given is extracted from a web page.
    Only return ${this.keywordLimit} comma seperated topics e.g. "football, sport, soccer" 
    Do not return any other information. If you are not sure what keywords to return, return nothing.`
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
      content: `### Content: ${content}`
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