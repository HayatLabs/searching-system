import axios from 'axios';
import * as cheerio from 'cheerio';
import { ISearchAdapter } from './search-adapter.interface.js';
import { SearchResult } from '../models/index.js';

export class YahooSearchAdapter implements ISearchAdapter {
  
  // ১. ডাইনামিক ইউজার এজেন্ট লিস্ট
  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // ২. ডাইনামিক হেডার জেনারেটর
  private getDynamicHeaders() {
    return {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.google.com/', // রেফারার হিসেবে গুগল ব্যবহার করা নিরাপদ
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Cache-Control': 'no-cache',
    };
  }

  async search(query: string, limit: number): Promise<SearchResult[]> {
    console.log(`🔍 Live searching for: "${query}"...`);

    // প্রথমে ইয়াহু ট্রাই করবে
    let results = await this.tryYahoo(query, limit);

    // যদি ইয়াহু ব্লক করে (৫০০ এরর) তবে DuckDuckGo ট্রাই করবে
    if (results.length === 0) {
      console.warn('⚠️ Yahoo blocked. Switching to DuckDuckGo...');
      results = await this.tryDuckDuckGo(query, limit);
    }

    return results;
  }

  private async tryYahoo(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}&b=${Math.floor(Math.random() * 10)}&pz=10`;
      
      const { data } = await axios.get(searchUrl, { 
        headers: this.getDynamicHeaders(), 
        timeout: 10000 
      });

      const $ = cheerio.load(data);
      const results: SearchResult[] = [];

      // selector changed to match yahoo
      $('div.algo-sr, div.dd.algo').each((_, el) => {
        if (results.length >= limit) return;
        
        const title = $(el).find('h3.title a').text().trim();
        const rawUrl = $(el).find('h3.title a').attr('href') || '';
        
        let cleanUrl = rawUrl;
        if (rawUrl.includes('/RU=')) {
            try {
                cleanUrl = decodeURIComponent(rawUrl.split('/RU=')[1].split('/RK=')[0]);
            } catch (e) {}
        }

        if (cleanUrl && !cleanUrl.includes('yahoo.com') && title.length > 2) {
          results.push({
            title,
            url: cleanUrl,
            snippet: $(el).find('.compText').text().trim() || "Web result found."
          });
        }
      });

      return results;
    } catch (error) {
      // @ts-ignore
      console.error(` Yahoo Error: ${error.response?.status || error.message}`);
      return [];
    }
  }

  private async tryDuckDuckGo(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(ddgUrl, { 
        headers: this.getDynamicHeaders(), 
        timeout: 10000 
      });
      
      const $ = cheerio.load(data);
      const results: SearchResult[] = [];

      $('.result__body').each((_, el) => {
        if (results.length >= limit) return;
        const title = $(el).find('.result__a').text().trim();
        const url = $(el).find('.result__url').text().trim();

        if (title && url) {
          results.push({
            title,
            url: url.startsWith('http') ? url : `https://${url}`,
            snippet: $(el).find('.result__snippet').text().trim() || "Click to visit website"
          });
        }
      });

      return results;
    } catch (error) {
      console.error(' DuckDuckGo also failed.');
      return [];
    }
  }
}