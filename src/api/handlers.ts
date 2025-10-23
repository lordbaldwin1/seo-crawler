import { Request, Response } from "express";
import { crawlSiteAsync } from "../crawler/crawl";
import { BadRequestError } from "../utils.ts/errors";

export type CrawlURLQueryParameters = {
  url: string;
  maxPages: string;
};

export async function handlerCrawlURL(
  req: Request<{}, {}, {}, CrawlURLQueryParameters>,
  res: Response
) {
  const { url, maxPages } = req.query;
  const maxPagesNum = parseInt(maxPages);

  if (isNaN(maxPagesNum) || maxPagesNum <= 0) {
    throw new BadRequestError("Max pages must be a number greater than 0");
  }

  if (!url) {
    throw new BadRequestError("URL is required");
  }

  const pageData = await crawlSiteAsync(url, undefined, maxPagesNum);

  res.status(200).send(pageData);
}
