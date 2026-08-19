import axios from 'axios';
import * as cheerio from 'cheerio';
import { ISearchAdapter } from './search-adapter.interface.js';
import { SearchResult } from '../models/index.js';

export class DuckDuckGoSearchAdapter implements ISearchAdapter {
  async search(query: string, limit: number): Promise<SearchResult[]> {
    console.log(` Live searching for: "${query}" using Yahoo Search (Free & Robust)...`);

    try {
      const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;

      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      const $ = cheerio.load(data);
      
      const pageTitle = $('title').text().trim();
      console.log(`[Debug] Yahoo Response Page Title: "${pageTitle}"`);

      const externalLinks = $('a[href*="/RU="]')
        .toArray()
        .map((el) => {
          const href = $(el).attr('href') || '';
          const title = $(el).text().trim();
          let cleanUrl = '';
          try {
            const parts = href.split('/RU=');
            if (parts[1]) {
              cleanUrl = decodeURIComponent(parts[1].split('/RK=')[0]);
            }
          } catch {
            // ignore
          }
          return { title, rawUrl: href, cleanUrl };
        })
        .filter((item) => {

          // yahoo own links are not useful for our search results
          const isYahoo = item.cleanUrl.includes('yahoo.com') || item.cleanUrl.includes('yahoo.co');
          


          // removeing the Bing ads from the results
          const isBingAd = item.cleanUrl.includes('bing.com');

          return item.cleanUrl && !isYahoo && !isBingAd && item.title.length > 2;
        });

      console.log(`[Debug] Total Genuine External Links Found: ${externalLinks.length}`);

      const results: SearchResult[] = [];

      externalLinks.forEach((item) => {
        if (results.length >= limit) return;

        const isDuplicate = results.some((r) => r.url === item.cleanUrl);
        if (!isDuplicate) {
          results.push({
            title: item.title,
            url: item.cleanUrl,
            snippet: "Click to visit this website..."
          });
        }
      });

      console.log(`[Search] Processed ${results.length} organic web results.`);
      return results;

    } catch (error) {
      console.error('[Search Error] Yahoo search failed:', error);
      return [];
    }
  }
}