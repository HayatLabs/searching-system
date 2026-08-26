import axios from 'axios';
import * as cheerio from 'cheerio';
import { ISearchAdapter } from './search-adapter.interface.js';
import { SearchResult } from '../models/index.js';

export class YahooSearchAdapter implements ISearchAdapter {
  private SCRAPER_API_KEY = 'YOUR_SCRAPERAPI_KEY'; 

  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  private getHeaders() {
    return {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.google.com/',
      'Connection': 'keep-alive',
    };
  }

  async search(query: string, limit: number): Promise<SearchResult[]> {
    let results = await this.tryDuckDuckGo(query, limit);

    if (results.length === 0) {
      results = await this.tryYahooProxy(query, limit);
    }

    return results;
  }

  private async tryDuckDuckGo(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(url, { headers: this.getHeaders(), timeout: 10000 });
      const $ = cheerio.load(data);
      const results: SearchResult[] = [];

      $('.result__body').each((_, el) => {
        if (results.length >= limit) return;
        const title = $(el).find('.result__a').text().trim();
        const rawUrl = $(el).find('.result__a').attr('href') || '';
        const snippet = $(el).find('.result__snippet').text().trim();

        if (title && rawUrl) {
          results.push({
            title,
            url: rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`,
            snippet: snippet || "View website content..."
          });
        }
      });
      return results;
    } catch {
      return [];
    }
  }

  private async tryYahooProxy(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const targetUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}&no_cache=${Math.random()}`;
      const proxyUrl = `http://api.scraperapi.com?api_key=${this.SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}`;

      const { data } = await axios.get(proxyUrl, { timeout: 20000 });
      const $ = cheerio.load(data);
      const results: SearchResult[] = [];

      $('div.algo-sr, div.dd.algo').each((_, el) => {
        if (results.length >= limit) return;
        const titleEl = $(el).find('h3.title a');
        const title = titleEl.text().trim();
        const href = titleEl.attr('href') || '';
        
        let cleanUrl = href;
        if (href.includes('/RU=')) {
          try {
            cleanUrl = decodeURIComponent(href.split('/RU=')[1].split('/RK=')[0]);
          } catch {}
        }

        if (cleanUrl && !cleanUrl.includes('yahoo.com') && title.length > 2) {
          results.push({
            title,
            url: cleanUrl,
            snippet: $(el).find('.compText').text().trim() || "Web result found via Yahoo."
          });
        }
      });
      return results;
    } catch {
      return [];
    }
  }
}