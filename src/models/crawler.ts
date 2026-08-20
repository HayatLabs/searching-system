import { DiscoveredRoutes } from '../crawler/link-discoverer';

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
  about?: string;
  contact?: {
    emails: string[];
    phones: string[];
    socials: string[];
  };
  discoveredRoutes?: DiscoveredRoutes; 
  metadata: {
    wordCount?: number;
    fetchedAt: string;
    image?: string;
    isSocialMedia?: boolean;
  };
}