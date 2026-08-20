import { RankedResult, SearchResult } from '../models';



export class ResultRanker {
  private blacklist = ['pinterest.com', 'instagram.com', 'tumblr.com', 'flickr.com', 'reddit.com'];

  public rankAndFilter(results: SearchResult[], query: string): SearchResult[] {
    console.log(`[Ranking] Ranking and filtering ${results.length} raw search results...`);

    const ranked: RankedResult[] = results
      .filter((result) => {
        try {
          const hostname = new URL(result.url).hostname;
          const isBlacklisted = this.blacklist.some((domain) => hostname.includes(domain));
          return !isBlacklisted;
        } catch {
          return false; 
        }
      })
      .map((result) => {
        const score = this.calculateRelevance(result, query);
        return { ...result, score };
      })
      .sort((a, b) => b.score - a.score);

    const uniqueDomainResults = ranked.filter((result, index, self) => {
      try {
        const domain = new URL(result.url).hostname;
        const firstIndex = self.findIndex((r) => new URL(r.url).hostname === domain);
        return index === firstIndex;
      } catch {
        return false;
      }
    });

    console.log(`[Ranking] Selected ${uniqueDomainResults.length} high-quality unique domains for crawling.`);
    return uniqueDomainResults;
  }

  private calculateRelevance(result: SearchResult, query: string): number {
    const cleanQuery = query.toLowerCase();
    
    const titleMatches = (result.title.toLowerCase().match(new RegExp(cleanQuery, 'g')) || []).length;
    const snippetMatches = (result.snippet.toLowerCase().match(new RegExp(cleanQuery, 'g')) || []).length;

    return (titleMatches * 3) + snippetMatches;
  }
}