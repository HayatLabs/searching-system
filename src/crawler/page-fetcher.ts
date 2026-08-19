import axios from 'axios';
import { CrawlResult } from '../models';

export class PageFetcher {
  private timeout = 8000; 

  // ইউআরএল রিরাইটার (URL Rewriter)
  private prepareUrl(url: string): string {
    // ১. ফেসবুকের লিঙ্ককে m.facebook.com (মডার্ন মোবাইল সাইট) এ রূপান্তর করছি
    if (url.includes('facebook.com') && !url.includes('m.facebook.com')) {
      console.log(`[Crawler] Rewriting Facebook URL to m.facebook.com for stable mobile fetch...`);
      return url
        .replace('www.facebook.com', 'm.facebook.com')
        .replace('mbasic.facebook.com', 'm.facebook.com');
    }

    // ২. লিঙ্কডইনের জন্য গুগল ক্যাশ মেথড
    if (url.includes('linkedin.com')) {
      console.log(`[Crawler] Rewriting LinkedIn URL to Google Cache to bypass login wall...`);
      return `http://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`;
    }

    // ৩. টুইটার/এক্স এর লিঙ্ক
    if (url.includes('twitter.com') || url.includes('x.com')) {
      console.log(`[Crawler] Rewriting Twitter URL to Nitter for non-blocking scrape...`);
      return url
        .replace('twitter.com', 'nitter.net')
        .replace('x.com', 'nitter.net');
    }

    return url;
  }

  // ডাইনামিক হেডার
  private getHeaders(targetUrl: string): Record<string, string> {
    const defaultHeaders = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    };

    // ১. ফেসবুক মোবাইলের জন্য আসল iPhone Safari User-Agent (এটি ১00% ফায়ারওয়াল বাইপাস করবে)
    if (targetUrl.includes('m.facebook.com')) {
      return {
        ...defaultHeaders,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        'Connection': 'keep-alive'
      };
    }

    // ২. গুগল ক্যাশ এর জন্য ডেস্কটপ হেডার
    if (targetUrl.includes('googleusercontent.com')) {
      return {
        ...defaultHeaders,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        'Referer': 'https://google.com'
      };
    }

    // ৩. ডিফল্ট ডেস্কটপ হেডার
    return {
      ...defaultHeaders,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
    };
  }

  async fetchSingle(url: string): Promise<CrawlResult | null> {
    const targetUrl = this.prepareUrl(url);
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