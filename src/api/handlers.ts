import { Request, Response } from "express";
import { crawlSiteAsync, ExtractedPageData, normalizeURL } from "../crawler/crawl";
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

  try {
    new URL(url);
  } catch {
    throw new BadRequestError("URL is not a valid URL");
  }

  const pageData = await crawlSiteAsync(url, undefined, maxPagesNum);

  const graphData: ReactForceGraphShape = {
    nodes: [],
    links: [],
  };

  const nodeAdded: Record<string, boolean> = {};
  for (const [url, data] of Object.entries(pageData)) {
    if (nodeAdded[url]) {
      continue;
    }

    graphData.nodes.push({ id: url });
    nodeAdded[url] = true;

    for (const outgoing_url of data.outgoing_links) {
      const normalizedOutgoingURL = normalizeURL(outgoing_url);

      if (!pageData[normalizedOutgoingURL] && !nodeAdded[normalizedOutgoingURL]) {
        nodeAdded[normalizedOutgoingURL] = true;
        graphData.nodes.push({ id: normalizedOutgoingURL });
      }

      graphData.links.push({ source: url, target: normalizedOutgoingURL });
    }
  }

  type Body = {
    GraphDataBody: ReactForceGraphShape,
    PageDataBody: Record<string, ExtractedPageData>,
  }
  const body: Body = {
    GraphDataBody: graphData,
    PageDataBody: pageData,
  }

  res.status(200).send(body);
}
