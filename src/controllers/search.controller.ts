import { Request, Response, NextFunction } from 'express';
import { SearchOrchestrator } from '../orchestrator.js';
import ApiError from '../ApiError.js';

export class SearchController {
  private orchestrator = new SearchOrchestrator();

  public search = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    if (!query) {
      return next(
        new ApiError(400, "Query parameter 'q' is required. Example: /search?q=TypeScript")
      );
    }

    try {
      const results = await this.orchestrator.searchAndDiscover(query, limit);
      
      return res.json({
        status: "success",
        query,
        totalSources: results.length,
        data: results
      });
    } catch (error: any) {
      next(ApiError.from(error));
    }
  };

  public fetch = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const url = req.query.url as string;

    if (!url) {
      return next(
        new ApiError(400, "Query parameter 'url' is required. Example: /fetch?url=https://example.com")
      );
    }

    try {
      const result = await this.orchestrator.fetchAndDiscoverSingle(url);
      
      if (!result) {
        return next(new ApiError(404, `Failed to crawl or fetch the provided URL: ${url}`));
      }

      return res.json({
        status: "success",
        url,
        data: result
      });
    } catch (error: any) {
      next(ApiError.from(error));
    }
  };


}