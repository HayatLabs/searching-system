import * as cheerio from 'cheerio';
import { CrawlResult, ExtractedContent } from '../models';

export class ContentExtractor {
  public async extract(crawlResult: CrawlResult): Promise<ExtractedContent> {
    const { url, rawHtml } = crawlResult;
    // console.log(`[Extractor] Extracting content from: ${url}`);
    // console.log("row html => ", rawHtml)
    const $ = cheerio.load(rawHtml);

    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    const ogDescription = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';

    let finalContent = "";
    const isFacebook = url.includes('facebook.com');

    if (isFacebook) {
      console.log(`[Extractor] Running dedicated Facebook post extractor...`);

      const facebookPosts = $('.story_body_container, [data-ft]')
        .toArray()
        .map((el) => {
          const postText = $(el).text().trim();
          return postText;
        })
        .filter((text) => {
          return text.length > 25 &&
            !text.startsWith('Like') &&
            !text.startsWith('Comment') &&
            !text.includes('React');
        })
        .slice(0, 4)
        .map((text, index) => `Post ${index + 1}:\n"${text.substring(0, 250)}..."`); 

      const contactInfo = $('div:contains("About"), div:contains("Contact"), .bio')
        .toArray()
        .map((el) => $(el).text().trim())
        .filter((text) => text.length > 10 && text.length < 150)
        .slice(0, 2)
        .join('\n');

      const postsContent = facebookPosts.join('\n\n-------------------------\n\n');

      finalContent = `=== Profile Summary ===\n${ogDescription}\n\n`;
      if (contactInfo) {
        finalContent += `=== Contact/About Info ===\n${contactInfo}\n\n`;
      }
      if (facebookPosts.length > 0) {
        finalContent += `=== Recent Posts ===\n\n${postsContent}`;
      } else {
        finalContent += `=== Recent Posts ===\nNo public posts found.`;
      }

    } else {
      $('script, style, noscript, header, footer, nav, iframe, aside, .ads, .menu, #menu, .sidebar, #sidebar').remove();

      const bodyParagraphs = $('p, h1, h2, h3, h4, li')
        .toArray()
        .map((el) => $(el).text().trim())
        .filter((text) => text.length > 10);

      const bodyContent = bodyParagraphs.join('\n\n');

      const isOtherSocialMedia = url.includes('linkedin.com') || url.includes('twitter.com') || url.includes('instagram.com');

      finalContent = bodyContent;
      if (isOtherSocialMedia || bodyContent.length < 200) {
        finalContent = ogDescription || bodyContent || "No readable content found on this page.";
      }
    }

    const wordCount = finalContent.split(/\s+/).filter(Boolean).length;

    return {
      url,
      title: ogTitle || "Untitled Page",
      content: finalContent,
      metadata: {
        wordCount,
        fetchedAt: new Date().toISOString(),
        image: ogImage,
        isSocialMedia: isFacebook || url.includes('linkedin.com') || url.includes('twitter.com')
      }
    };
  }
}