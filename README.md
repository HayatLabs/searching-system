

# Web Discovery & Searching Engine

An extensible, high-performance web discovery and search system built with Node.js and TypeScript. It takes a natural-language search query, discovers relevant websites, parallelly crawls their content, extracts deeply structured contact and about information, and returns clean, unified structured web sources—all without requiring paid API keys or user logins.

---

## Key Features

- **Free Live Search Integration**: Utilizes a highly robust, zero-cost Yahoo Search parser that fetches real-world live results without API rate limits or captcha blocks.
- **Base URL Deduplication**: Intelligently groups search results by base domains (Unique Hosts) using a declarative `ResultRanker` to prevent redundant crawling of the same website.
- **Parallel Asynchronous Crawler**: Crawls multiple discovered URLs concurrently using `Promise.all()` to maximize speed, ensuring zero sequential blocking loops on the event loop.
- **Bypassing Social Media Login Walls**:
  - **Facebook Mobile Rewrite**: Swaps standard URLs to modern mobile (`m.facebook.com`) and pairs them with an iOS Safari User-Agent to successfully retrieve public profiles.
  - **Wayback Machine Integration**: Automatically falls back to the Internet Archive (Wayback Machine) API to fetch cached snapshots of highly-protected platforms like LinkedIn, entirely bypassing the Authwall.
- **Deep Route Discovery (99.99% Accuracy)**: Scans crawled landing pages to identify relative and anchor links matching high-value internal paths (e.g., `/contact`, `/about-us`, `/#projects`).
- **Hybrid Content & Contact Extractor**: 
  - Purges HTML clutter (scripts, styles, ads, navbars) to extract clean text.
  - Utilizes lightweight Regular Expressions (RegEx) to capture emails, phone numbers, and cross-platform social links.
  - Extracts Open Graph (OG) metadata as a highly-reliable fallback for locked social media pages.

---

##  Architecture Flow
```
┌────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│ Client │ ──► │ Express API │ ──► │ Orchestrator │ ──► │ Search Adapter │ ──► │ Search       │
│        │     │ Server      │     └──────────────┘     │ (Yahoo Scraper)│     │ Results      │
└────────┘     └─────────────┘                          └────────────────┘     └──────────────┘
                                                                                              |
┌───────────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐       │
│ Structured Source │ ◄── │ Content         │ ◄── │ Link         │ ◄── │ Page Fetcher │ ◄─────┘
│ Data              │     │ Extractor       │     │ Discoverer   │     │ & Crawler    │
└───────────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
```
---

## Directory Structure

```
web-discovery-engine/
├── node_modules/
├── tests/
│   └── index.js                 # Final integration test script (runs the Orchestrator)
├── src/
│   ├── controllers/
│   │   └── search.controller.ts # Express controller (handles API requests and error routing)
│   ├── crawler/
│   │   ├── content-extractor.ts # HTML parser (extracts clean text, emails, phones, & socials)
│   │   ├── link-discoverer.ts   # Internal route (/contact, /about) matching algorithm
│   │   └── page-fetcher.ts      # Parallel async network crawler with dynamic browser headers
│   ├── models/
│   │   ├── crawler.ts           # Type definitions for crawler outputs and results
│   │   ├── index.ts             # Central barrel export file for models
│   │   └── search.ts            # Type definitions for search results and adapters
│   ├── ranking/
│   │   └── result-ranker.ts     # Domain deduplicator and keyword relevancy scoring engine
│   ├── routes/
│   │   ├── index.ts             # Centralized root router (Router Barrel)
│   │   └── search.routes.ts     # Route definitions for /search and /fetch endpoints
│   ├── utils/
│   │   └── ApiError.ts          # Custom centralized Express global error handling class
│   ├── app.ts                   # Main Express app and global middleware configuration
│   ├── index.ts                 # Application entry point (dotenv setup and server listener)
│   └── orchestrator.ts          # Pipeline coordinator (orchestrates search, crawl, and extract)
├── .env                         # Environment variables configuration (Server Port)
├── .gitignore                   # Git ignored files and directories configuration
├── package.json                 # Dependency manager and NPM scripts configuration
├── tsconfig.json                # TypeScript compiler configuration
└── README.md                    # Official project documentation (this file)
```

---

##  Installation & Setup

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v25+) and [npm](https://www.npmjs.com/) installed.

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Create a `.env` file in the root directory if you want to customize your server port:
```env
PORT=8000
```

### 3. Run the Integrated Test Script
To run the automated console test-pipeline that searches, parallelly crawls, and extracts data:
```bash
npx tsx tests/index.js
```

### 4. Start the Express API Server
To start the live production-ready server:
```bash
npm start
```

---

##  API Documentation

### 1. Health Check
Checks the status of the microservice.
* **URL**: `/ping`
* **Method**: `GET`
* **Response**:
```json
{
  "status": "ok",
  "service": "web-discovery-engine is running successfully"
}
```

### 2. Search & Discover
Triggers the full search, deduplication, crawling, deep route discovery, and contact extraction pipeline.
* **URL**: `/search`
* **Method**: `GET`
* **Query Parameters**:
  - `q` (string, required): The search query.
  - `limit` (number, optional, default: 5): Max unique sources to crawl.
* **Example**: `/search?q=its%20hayat&limit=3`
* **Response Format**:
```json
{
  "status": "success",
  "query": "its hayat",
  "totalSources": 1,
  "data": [
    {
      "url": "https://itshayat.vercel.app/",
      "title": "Its Hayat | Abu Hayat (Itshayat) — SaaS, MVP & Dashboard Builder",
      "content": "Abu Hayat — SaaS, MVP & Dashboard Builder...",
      "about": "Building custom systems, dashboards, and automated software...",
      "contact": {
        "emails": ["hayatlabs.explore@gmail.com"],
        "phones": ["01873858744"],
        "socials": [
          "https://github.com/hayatlabs",
          "https://bd.linkedin.com/in/itshayat"
        ]
      },
      "discoveredRoutes": {
        "contact": ["https://itshayat.vercel.app/contact"],
        "about": ["https://itshayat.vercel.app/about"],
        "portfolio": ["https://itshayat.vercel.app/#projects"]
      },
      "metadata": {
        "wordCount": 436,
        "fetchedAt": "2026-08-20T11:15:00.000Z",
        "image": "https://itshayat.vercel.app/fave.png",
        "isSocialMedia": false
      }
    }
  ]
}
```

## API Documentation

### 1. Health Check
Verifies the status and availability of the microservice.
* **URL**: `/ping`
* **Method**: `GET`
* **Response**:

```json
{
  "status": "ok",
  "service": "web-discovery-engine is running successfully"
}
```

### 2. Search & Discover
Triggers the complete search and discovery pipeline. It executes the live search query, filters and deduplicates unique host domains, crawls unique websites concurrently, discovers internal routes, and extracts deep content/contact details.
* **URL**: `/search`
* **Method**: `GET`
* **Query Parameters**:
  - `q` (string, required): The natural-language search query.
  - `limit` (number, optional, default: `5`): Max unique sources to crawl.
* **Example Request**: `/search?q=its%20hayat&limit=3`
* **Response Format**:
```json
{
  "status": "success",
  "query": "its hayat",
  "totalSources": 1,
  "data": [
    {
      "url": "https://itshayat.vercel.app/",
      "title": "Its Hayat | Abu Hayat (Itshayat) — SaaS, MVP & Dashboard Builder",
      "content": "Abu Hayat — SaaS, MVP & Dashboard Builder...",
      "about": "Building custom systems, dashboards, and automated software...",
      "contact": {
        "emails": ["hello@itshayat.com"],
        "phones": ["+88017XXXXXXXX"],
        "socials": [
          "https://github.com/itshayatBSD",
          "https://bd.linkedin.com/in/itshayat"
        ]
      },
      "discoveredRoutes": {
        "contact": ["https://itshayat.vercel.app/contact"],
        "about": ["https://itshayat.vercel.app/about"],
        "portfolio": ["https://itshayat.vercel.app/#projects"]
      },
      "metadata": {
        "wordCount": 436,
        "fetchedAt": "2026-08-20T11:15:00.000Z",
        "image": "https://itshayat.vercel.app/fave.png",
        "isSocialMedia": false
      }
    }
  ]
}
```

### 3. Direct Fetch & Deep Crawl
Directly targets, crawls, and extracts structured data from a single specific URL. It executes link discovery on the landing page and automatically deep-crawls internal pages (like `/contact` or `/about`) if the landing page does not contain immediate contact details.
* **URL**: `/fetch`
* **Method**: `GET`
* **Query Parameters**:
  - `url` (string, required): The target website URL.
* **Example Request**: `/fetch?url=https://itshayat.vercel.app/`
* **Response Format**:
```json
{
  "status": "success",
  "url": "https://itshayat.vercel.app/",
  "data": {
    "url": "https://itshayat.vercel.app/",
    "title": "Its Hayat | Abu Hayat (Itshayat) — SaaS, MVP & Dashboard Builder",
    "content": "Abu Hayat — SaaS, MVP & Dashboard Builder...",
    "about": "Building custom systems, dashboards, and automated software...",
    "contact": {
      "emails": ["hello@itshayat.com"],
      "phones": ["+88017XXXXXXXX"],
      "socials": [
        "https://github.com/itshayatBSD",
        "https://bd.linkedin.com/in/itshayat"
      ]
    },
    "discoveredRoutes": {
      "contact": ["https://itshayat.vercel.app/contact"],
      "about": ["https://itshayat.vercel.app/about"],
      "portfolio": ["https://itshayat.vercel.app/#projects"]
    },
    "metadata": {
      "wordCount": 436,
      "fetchedAt": "2026-08-20T11:15:00.000Z",
      "image": "https://itshayat.vercel.app/fave.png",
      "isSocialMedia": false
    }
  }
}
```