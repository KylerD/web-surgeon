import * as cheerio from 'cheerio'
import { AnalysedWebPage } from "@/models/AnalysedWebPage";


export class AnalysisService {
  constructor() { }

  async analyseUrl(url: string): Promise<AnalysedWebPage> {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    $('script, style, noscript, footer, nav, iframe, img').remove();

    const links: string[] = [];

    $('body a')
      .each((idx, ele) => {
        const href = $(ele).attr('href') as string
        if (href.includes('#') || 'cookies') {
          return;
        }

        if (href.startsWith('/') || href.startsWith('https://')) {
          links.push(href);
        }
      })

    const content = $('body').text().replace(/\s+/g, ' ').trim();
    const sentences = content.split('.').map(s => s.trim()).filter(s => s.length > 0);

    return {
      content,
      links,
      sentences
    }
  }
}