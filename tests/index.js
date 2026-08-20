import { PageFetcher } from "../src/crawler/page-fetcher";
import { ContentExtractor } from "../src/crawler/content-extractor";

const runTest = async () => {
  const fetcher = new PageFetcher();
  const extractor = new ContentExtractor();

  const crawlResult = await fetcher.fetchSingle("https://www.facebook.com/joinventureai");
  

  if (crawlResult) {
    const cleanData = await extractor.extract(crawlResult);
    console.log("extractor result = ", cleanData)
    console.log(`Title: ${cleanData.title}`);
    console.log(`Word Count: ${cleanData.metadata.wordCount} words`);

    console.log(cleanData.content.substring() + "...\n");

    console.log("Metadata:", cleanData.metadata);

  } else {
    console.log("[Error] Page crawl failed.");
  }
};

runTest();