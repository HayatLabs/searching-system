import { ExtractedContent } from "./crawler";


export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface StructuredSource {
  query: string;
  sources: ExtractedContent[];
}

