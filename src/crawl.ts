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
}

export function extractPageData(html: string, pageURL: string) {
  return {
    url: pageURL,
    h1: getH1FromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  } satisfies ExtractedPageData;
};