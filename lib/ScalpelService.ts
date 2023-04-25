import { TokenService } from "./TokenService";


export class ScalpelService {
  constructor(
    private completionTokenLimit: number,
    private tokenService: TokenService) { }

  private getContextFromContent(content: string, contextMargin: number): string {
    const tokenizedContent = this.tokenService.encode(content);
    const analysisMargin = this.completionTokenLimit - contextMargin;

    if (tokenizedContent.length < analysisMargin) {
      return content;
    } else {
      const start = 0;
      const end = analysisMargin;
      return this.tokenService.decode(tokenizedContent.slice(start, end));
    }
  }

  getAllowableContextFromContent(content: string, contextMargin: number): string {
    return this.getContextFromContent(content, contextMargin);
  }
}