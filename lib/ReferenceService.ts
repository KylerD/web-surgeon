import { ChatCompletionRequestMessage, OpenAIApi } from "openai";
import { TokenService } from "./TokenService";
import { CompletionService } from "@/models/CompletionService";


export class ReferenceService implements CompletionService {
  systemContext: string
  unpredictableSafetyMargin: number = 50;

  constructor(private openAI: OpenAIApi, private referenceLimit: number, private tokenService: TokenService) {
    this.systemContext = `You are a link analysis tool.
    You will recieve an overview of the content of a web page and a list of links found on the web page.
    You will return the ${this.referenceLimit} most relevant links based on the content of the web page.
    Only return up to ${this.referenceLimit} comma seperated and quoted links e.g. "https://www.example.com", "https://www.another-example.co.uk/.
    Do not return any other information`
  }

  getContextMargin(): number {
    return this.tokenService.tokenCount(this.systemContext) +
      this.referenceLimit +
      this.unpredictableSafetyMargin;
  }

  async getReferences(content: string, links: string[]) {
    const systemMsg: ChatCompletionRequestMessage = {
      role: 'system',
      content: this.systemContext
    }

    if (links.length > 50) {
      links = links.slice(0, 50);
    }

    const userContext = `The content of the web page is: ${content}.
    The links found on the web page are: ${links.join(', ')}`;

    const userMsg: ChatCompletionRequestMessage = {
      role: 'user',
      content: userContext
    }

    const completionResponse = await this.openAI.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [systemMsg, userMsg]
    });

    const completionContent = completionResponse.data.choices[0].message?.content;
    const references = completionContent?.replace(/ /g, "").split(',');

    return references
  }
}