import { DissectedWebPage } from "@/models/DissectedWebPage";
import * as cheerio from 'cheerio'
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

  private summariseableContent(content: string, contextMargin: number): string {
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

  async dissect(url: string, contextMargin: number): Promise<DissectedWebPage> {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    $('script, style, noscript, header, footer, nav, iframe, img').remove();

    const internalLinks: string[] = [];
    const externalLinks: string[] = [];

    $('body a')
      .each((idx, ele) => {
        const href = $(ele).attr('href') as string
        if (href.startsWith('/')) {
          internalLinks.push(href);
        } else if (href.startsWith('https://')) {
          externalLinks.push(href);
        }
      })

    const content = $('body').text().replace(/\s+/g, ' ').trim();

    const summariseableContent = this.summariseableContent(content, contextMargin);
    const embeddableSections = this.embeddableSections(content);

    return {
      content,
      internalLinks,
      externalLinks,
      summariseableContent,
      embeddableSections
    }
  }
}