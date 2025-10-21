import { JSDOM } from "jsdom";

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

export async function getHTML(url: string) {
  console.log(`crawling ${url}`);

  let res;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "BaldStalker/1.0",
      },
    });
  } catch (err) {
    throw new Error(`network error: ${(err as Error).message}`);
  }

  if (res.status > 399) {
    console.error("request failed:", res.status, res.statusText);
    return;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    console.error("response is not html:", contentType);
    return;
  }

  return await res.text();
}

export async function crawlPage(
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {}
) {
  const baseDomain = new URL(baseURL).hostname;
  const currentDomain = new URL(currentURL).hostname;
  if (baseDomain !== currentDomain) {
    return pages;
  }

  const normalizedCurrent = normalizeURL(currentURL);

  if (pages[normalizedCurrent]) {
    pages[normalizedCurrent]++;
    return pages;
  }

  pages[normalizedCurrent] = 1;

  console.log(`crawling ${currentURL}`);
  let html: string;
  try {
    html = await getHTML(currentURL) ?? "";
  } catch (err) {
    console.log(`${(err as Error).message}`);
    return pages;
  }

  const urls = getURLsFromHTML(html, currentURL);
  urls.forEach(async (url) => {
    pages = await crawlPage(baseURL, url, pages);
  });

  return pages;
}
