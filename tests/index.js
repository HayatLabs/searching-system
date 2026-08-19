import { DuckDuckGoSearchAdapter } from "../src/search/duckduckgo-search.adapter";

const runTest = async () => {
  const adapter = new DuckDuckGoSearchAdapter();

  const results = await adapter.search("King Of King ", 7);

  console.log("--Search Results ");
  console.log(results);
};

runTest();