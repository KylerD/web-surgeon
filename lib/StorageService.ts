import { InsertPageRequest, Page } from "@/models/Page";
import { PageSentence } from "@/models/PageSentence";
import { SupabaseClient } from "@supabase/supabase-js";

export class StorageService {
  private client: SupabaseClient

  constructor() {
    this.client = new SupabaseClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);
  }

  async getPage(url: string): Promise<Page | null> {
    const { data: page } = await this.client
      .from('page')
      .select()
      .eq('url', url)
      .single();

    if (page) {
      return page as Page;
    } else {
      return null
    }
  }

  async getPageByReference(reference: string): Promise<Page | null> {
    const { data: page } = await this.client
      .from('page')
      .select()
      .eq('reference', reference)
      .single();

    if (page) {
      return page as Page;
    } else {
      return null
    }
  }

  async getMatchingPageSentences(pageId: string, embeddedQuery: number[]): Promise<PageSentence[]> {
    const { error, data: pageSentences } = await this.client.rpc('match_page_sentences', {
      embedding: embeddedQuery,
      page_id: pageId,
      match_threshold: 0.8,
      match_count: 100,
      min_content_length: 5
    });

    if (error) {
      console.error(error);
      throw error;
    }

    return pageSentences as PageSentence[];
  }

  async insertPage(page: InsertPageRequest): Promise<Page> {
    const { error, data } = await this.client
      .from('page')
      .insert({
        url: page.url,
        overview: page.overview,
        keywords: page.keywords
      })
      .select()
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      throw error;
    } else {
      return data as Page;
    }
  }

  async insertPageSentences(pageId: string, pageSentences: PageSentence[]): Promise<void> {
    for (const pageSentence of pageSentences) {
      const { error: upsertEmbeddedSentenceError } = await this.client
        .from('page_sentence')
        .insert({
          page_id: pageId,
          content: pageSentence.content,
          embedding: pageSentence.embedding
        });

      if (upsertEmbeddedSentenceError) {
        throw upsertEmbeddedSentenceError;
      }
    }

  }
}