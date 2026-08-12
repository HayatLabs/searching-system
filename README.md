# Searching System

An extensible web discovery and search system that takes a natural-language search query, discovers relevant websites, fetches their content, and returns structured web sources.

## Architecture

```text
                         ┌──────────────────┐
                         │      Client      │
                         └────────┬─────────┘
                                  │
                                  │ Search Query
                                  ▼
                         ┌──────────────────┐
                         │   Express API    │
                         │      Server      │
                         └────────┬─────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Search Orchestrator │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │   Search Adapter    │
                       │                     │
                       │ GoogleSearchAdapter │
                       └──────────┬──────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Search Results  │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Result Ranking  │
                         │   & Filtering    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   URL Collector  │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    Web Crawler   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Page Fetcher   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Content Extractor│
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Structured Source│
                         │      Data        │
                         └──────────────────┘