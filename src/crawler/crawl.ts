import { JSDOM } from "jsdom";
import pLimit from "p-limit";

class ConcurrentCrawler {
  private baseURL: string;
  private pages: Record<string, ExtractedPageData> = {};
  private limit: <T>(fn: () => Promise<T>) => Promise<T>;

  private maxPages: number;
  private shouldStop = false;
  private allTasks = new Set<Promise<void>>();
  private abortController = new AbortController();

  private visited = new Set<string>();

  constructor(
    baseURL: string,
    maxConcurrency: number = 5,
    maxPages: number = 50
  ) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(maxConcurrency);
    this.maxPages = maxPages;
  }

  private addPageVisit(normalizedURL: string) {
    if (this.shouldStop) {
      return false;
    }

    if (this.visited.has(normalizedURL)) {
      return false;
    }

    if (this.visited.size >= this.maxPages) {
      this.shouldStop = true;
      console.log("Reached maximum number of pages to crawl.");
      this.abortController.abort();
      return false;
    }

    this.visited.add(normalizedURL);
    return true;
  }

  private async getHTML(url: string) {
    const { signal } = this.abortController;

    return await this.limit(async () => {
      console.log(`crawling ${url}`);
      let res: Response;
      try {
        res = await fetch(url, {
          headers: {
            "User-Agent": "BaldStalker/1.0",
          },
          signal,
        });
      } catch (err) {
        if ((err as any)?.name === "AbortError") {
          throw new Error("Fetch aborted");
        }
        throw new Error(`Network error: ${(err as Error).message}`);
      }

      if (res.status > 399) {
        console.error("Request failed:", res.status, res.statusText);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("text/html")) {
        console.error("Response is not html:", contentType);
        return;
      }

      return await res.text();
    });
  }

  private async crawlPage(currentURL: string) {
    if (this.shouldStop) {
      return;
    }

    const baseDomain = new URL(this.baseURL).hostname;
    const currentDomain = new URL(currentURL).hostname;
    if (baseDomain !== currentDomain) {
      return;
    }

    const normalizedCurrent = normalizeURL(currentURL);

    const isNewPage = this.addPageVisit(normalizedCurrent);
    if (!isNewPage) {
      return;
    }

    console.log(`crawling ${currentURL}`);
    let html: string;
    try {
      html = (await this.getHTML(currentURL)) ?? "";
      if (html.length > 0) {
        this.pages[normalizedCurrent] = extractPageData(html, currentURL);
      }
    } catch (err) {
      console.log(`${(err as Error).message}`);
      return;
    }

    if (this.shouldStop) {
      return;
    }

    const urls = getURLsFromHTML(html, currentURL);

    const urlPromises = Array.from(urls, (url) => {
      if (this.shouldStop) {
        return;
      }
      const p = this.crawlPage(url);
      this.allTasks.add(p);
      p.finally(() => this.allTasks.delete(p));
    });

    await Promise.all(urlPromises);
  }

  public async crawl() {
    const rootTask = this.crawlPage(this.baseURL);
    this.allTasks.add(rootTask);
    try {
      await rootTask;
    } finally {
      this.allTasks.delete(rootTask);
    }
    await Promise.allSettled(Array.from(this.allTasks));
    return this.pages;
  }
}

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 5,
  maxPages: number = 100
) {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
  return await crawler.crawl();
}

export function normalizeURL(url: string) {
  const urlObj = new URL(url);

  const hostname = urlObj.hostname;
  const pathname = urlObj.pathname;

  if (pathname.slice(-1) === "/") {
    return hostname + pathname.slice(0, pathname.length - 1);
  }
  return hostname + pathname;
}

export function getH1FromHTML(html: string) {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const firstH1 = doc.querySelector("h1")?.textContent;
    return firstH1?.trim() || "";
  } catch {
    return "";
  }
}

export function getFirstParagraphFromHTML(html: string) {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const main = doc.querySelector("main");
    const p = main?.querySelector("p") ?? doc.querySelector("p");

    return p?.textContent.trim() || "";
  } catch {
    return "";
  }
}

export function getURLsFromHTML(html: string, baseURL: string) {
  const urls: string[] = [];
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const elements = doc.querySelectorAll("a");

    elements.forEach((element) => {
      const href = element.getAttribute("href");
      if (!href) return;

      try {
        const url = new URL(href, baseURL).toString();
        urls.push(url);
      } catch (err) {
        console.error(`invalid href '${href}':`, err);
      }
    });
  } catch (err) {
    console.error("failed to parse HTML:", err);
  }
  return urls;
}

export function getImagesFromHTML(html: string, baseURL: string) {
  const imageURLs: string[] = [];
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const elements = doc.querySelectorAll("img");
    elements.forEach((element) => {
      const src = element.getAttribute("src");
      if (!src) return;

      try {
        const url = new URL(src, baseURL).toString();
        imageURLs.push(url);
      } catch (err) {
        console.error(`invalid src '${src}':`, err);
      }
    });
  } catch (err) {
    console.error("failed to parse html:", err);
  }
  return imageURLs;
}

export type ExtractedPageData = {
  url: string;
  h1: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
};

export function extractPageData(html: string, pageURL: string) {
  return {
    url: pageURL,
    h1: getH1FromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  } satisfies ExtractedPageData;
}
