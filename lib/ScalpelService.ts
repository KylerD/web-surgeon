import { DissectedWebPage } from "@/models/DissectedWebPage";
import { encode, decode } from 'gpt-3-encoder'
import * as cheerio from 'cheerio'

const EMBEDDING_MAX_TOKENS = 8191;
const COMPLETION_MAX_TOKENS = 2048;
const COMPLETION_RESPONSE_MAX_TOKENS = 300;

export class ScalpelService {

  private embeddableSections(content: string): string[] {
    const tokenizedContent = encode(content);

    if (tokenizedContent.length > EMBEDDING_MAX_TOKENS) {
      const sectionCount = Math.ceil(tokenizedContent.length / EMBEDDING_MAX_TOKENS);

      const sections = [];

      for (let i = 0; i < sectionCount; i++) {
        const start = i;
        const end = i + EMBEDDING_MAX_TOKENS;
        sections.push(decode(tokenizedContent.slice(start, end)));
      }

      return sections;
    }

    return [content];
  }

  private summariseableContent(content: string): string {
    const tokenizedContent = encode(content);
    const summarySpace = COMPLETION_MAX_TOKENS - COMPLETION_RESPONSE_MAX_TOKENS;

    if (tokenizedContent.length < summarySpace) {
      return content;
    } else {
      const start = 0;
      const end = summarySpace;
      return decode(tokenizedContent.slice(start, end));
    }
  }

  async dissect(url: string): Promise<DissectedWebPage> {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    $('script, style, noscript, header, footer, nav, iframe, img').remove();

    const links: string[] = $('body a')
      .filter((idx, ele) => {
        const href = $(ele).attr('href');
        if (!href) return false;

        return href.startsWith('/')
      })
      .map((idx, ele) => $(ele).attr('href') as string).get();

    const content = $('body').text().replace(/\s+/g, ' ').trim();
    const embeddableSections = this.embeddableSections(content);
    const summariseableContent = this.summariseableContent(content);

    return {
      content,
      links,
      embeddableSections,
      summariseableContent
    }
  }

  getSummaryAllowance(): number {
    return COMPLETION_RESPONSE_MAX_TOKENS;
  }
}