import { SearchResult } from '../models';

export interface ISearchAdapter {
  search(query: string, limit: number): Promise<SearchResult[]>;
}