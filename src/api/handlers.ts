import { Request, Response } from "express";
import { crawlSiteAsync } from "../crawler/crawl";
import { BadRequestError } from "../utils.ts/errors";

export type CrawlURLQueryParameters = {
  url: string;
  maxPages: string;
};

export type ReactForceGraphShape = {
  nodes: {
    id: string;
  }[];
  links: {
    source: string;
    target: string;
  }[];
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

  // react-force-graph shape
  // nodes: [{"id": url},]
  // links: [{"source": url, "target": url},]

  const graphData: ReactForceGraphShape = {
    nodes: [],
    links: [],
  };

  for (const [url, data] of Object.entries(pageData)) {
    graphData.nodes.push({ id: url });
    for (const outgoing_url of data.outgoing_links) {
      graphData.links.push({ source: url, target: outgoing_url });
    }
  }
  
  res.status(200).send(graphData);
}
