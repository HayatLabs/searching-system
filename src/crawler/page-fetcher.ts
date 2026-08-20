import axios from 'axios';
import { CrawlResult } from '../models';

export class PageFetcher {
  private timeout = 8000; 

  private async getArchiveUrl(url: string): Promise<string | null> {
    try {
      const archiveApi = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
      const response = await axios.get(archiveApi, { timeout: 4000 });
      
      const snapshot = response.data?.archived_snapshots?.closest;
      if (snapshot && snapshot.available && snapshot.url) {
        return snapshot.url;
      }
      return null;
    } catch {
      return null; 
    }
  }

  private prepareUrl(url: string): string {
    if (url.includes('facebook.com') && !url.includes('m.facebook.com')) {
      console.log(`[Crawler] Rewriting Facebook URL to m.facebook.com for stable fetch...`);
      return url
        .replace('www.facebook.com', 'm.facebook.com')
        .replace('mbasic.facebook.com', 'm.facebook.com');
    }

    if (url.includes('twitter.com') || url.includes('x.com')) {
      console.log(`[Crawler] Rewriting Twitter URL to Nitter...`);
      return url
        .replace('twitter.com', 'nitter.net')
        .replace('x.com', 'nitter.net');
    }

    return url;
  }

  private getHeaders(targetUrl: string): Record<string, string> {
    const defaultHeaders = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    };

    if (targetUrl.includes('m.facebook.com')) {
      return {
        ...defaultHeaders,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        'Connection': 'keep-alive'
      };
    }

    return {
      ...defaultHeaders,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
    };
  }

  async fetchSingle(url: string): Promise<CrawlResult | null> {
    let targetUrl = this.prepareUrl(url);

    const isProtectedSite = url.includes('linkedin.com') || url.includes('facebook.com');
    if (isProtectedSite) {
      console.log(`[Crawler] Checking Internet Archive for: ${url}`);
      const archiveUrl = await this.getArchiveUrl(url);
      if (archiveUrl) {
        targetUrl = archiveUrl;
      }
    }

    const headers = this.getHeaders(targetUrl);

    try {
      console.log(`[Crawler] Fetching page content from: ${targetUrl}`);
      
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: headers
      });

      return {
        url,
        title: '',
        rawHtml: response.data,
        statusCode: response.status
      };

    } catch (error: any) {
      console.error(`[Crawler Error] Failed to fetch ${url}. Reason: ${error.message}`);
      return null;
    }
  }

  async fetchAll(urls: string[]): Promise<CrawlResult[]> {
    console.log(`[Crawler] Starting parallel fetch for ${urls.length} URLs...`);

    const fetchPromises = urls.map((url) => this.fetchSingle(url));
    const results = await Promise.all(fetchPromises);

    return results.filter((res): res is CrawlResult => res !== null);
  }
}