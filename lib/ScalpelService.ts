import { TokenService } from "./TokenService";


export class ScalpelService {
  constructor(
    private embeddingTokenLimit: number,
    private completionTokenLimit: number,
    private tokenService: TokenService) { }

  private embeddableSections(content: string): string[] {
    const tokenizedContent = this.tokenService.encode(content);

    if (tokenizedContent.length > this.embeddingTokenLimit) {
      const sectionCount = Math.ceil(tokenizedContent.length / this.embeddingTokenLimit);

      const sections = [];

      for (let i = 0; i < sectionCount; i++) {
        const start = i;
        const end = i + this.embeddingTokenLimit;
        const section = this.tokenService.decode(tokenizedContent.slice(start, end));
        sections.push(section);
      }

      return sections;
    }

    return [content];
  }

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

  getEmbeddableSections(content: string): string[] {
    return this.embeddableSections(content);
  }
}