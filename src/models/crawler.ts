export interface CrawlResult {
  url: string;
  title: string;
  rawHtml: string;
  statusCode: number;
}

export interface ExtractedContent {
  url: string;
  title: string;
  content: string;
  metadata: {
    wordCount?: number;
    fetchedAt: string;
  };
}