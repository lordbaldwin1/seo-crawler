import { expect, test } from "vitest";
import {
  ExtractedPageData,
  extractPageData,
  getFirstParagraphFromHTML,
  getH1FromHTML,
  getImagesFromHTML,
  getURLsFromHTML,
  normalizeURL,
} from "./crawl";

test("normalizeURL protocol", () => {
  const input = "https://blog.boot.dev/path";
  const actual = normalizeURL(input);
  const expected = "blog.boot.dev/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL slash", () => {
  const input = "https://blog.boot.dev/path/";
  const actual = normalizeURL(input);
  const expected = "blog.boot.dev/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL capitals", () => {
  const input = "https://BLOG.boot.dev/path";
  const actual = normalizeURL(input);
  const expected = "blog.boot.dev/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL http", () => {
  const input = "http://BLOG.boot.dev/path";
  const actual = normalizeURL(input);
  const expected = "blog.boot.dev/path";
  expect(actual).toEqual(expected);
});

test("getH1FromHTML only h1", () => {
  const input = "<h1>hello world</h1>";
  const actual = getH1FromHTML(input);
  const expected = "hello world";
  expect(actual).toEqual(expected);
});

test("getH1FromHTML nested h1", () => {
  const input = "<head><div><h1>hello world</h1></div></head>";
  const actual = getH1FromHTML(input);
  const expected = "hello world";
  expect(actual).toEqual(expected);
});

test("getH1FromHTML no h1", () => {
  const input = "<head><div>hello world</div></head>";
  const actual = getH1FromHTML(input);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main empty", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Outside paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML no p tags", () => {
  const inputBody = `
    <html><body>
      <h1>Outside paragraph.</h1>
      <main>
        <h1>Main paragraph.</h1>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML absolute", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><a href="https://blog.boot.dev"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><a href="/courses"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/courses"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative and absolute", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><a href="/courses"><span>Boot.dev</span></a><a href="https://blog.boot.dev/stinky"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = [
    "https://blog.boot.dev/courses",
    "https://blog.boot.dev/stinky",
  ];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML no <a> tags", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><h1 href="/courses"><span>Boot.dev</span></h1><h1 href="https://blog.boot.dev/stinky"><span>Boot.dev</span></h1></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML no hrefs", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><a><span>Boot.dev</span></a><a stinky"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML absolute", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="https://blog.boot.dev/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML no images", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/path/one"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML both absolute and relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody =
    `<html><body>` +
    `<a href="/path/one"><span>Boot.dev</span></a>` +
    `<a href="https://other.com/path/one"><span>Boot.dev</span></a>` +
    `</body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = [
    "https://blog.boot.dev/path/one",
    "https://other.com/path/one",
  ];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML absolute", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="https://blog.boot.dev/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML multiple", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody =
    `<html><body>` +
    `<img src="/logo.png" alt="Logo">` +
    `<img src="https://cdn.boot.dev/banner.jpg">` +
    `</body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = [
    "https://blog.boot.dev/logo.png",
    "https://cdn.boot.dev/banner.jpg",
  ];
  expect(actual).toEqual(expected);
});

test("extractPageData basic", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected: ExtractedPageData = {
    url: "https://blog.boot.dev",
    h1: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://blog.boot.dev/link1"],
    image_urls: ["https://blog.boot.dev/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData empty", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `
    <html><body>
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected: ExtractedPageData = {
    url: "https://blog.boot.dev",
    h1: "",
    first_paragraph: "",
    outgoing_links: [],
    image_urls: [],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData multiple outgoing links & image urls", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <a href="/link2">Link 2</a>
      <a href="/link3">Link 3</a>
      <img src="/image1.jpg" alt="Image 1">
      <img src="/image2.jpg" alt="Image 2">
      <img src="/image3.jpg" alt="Image 3">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected: ExtractedPageData = {
    url: "https://blog.boot.dev",
    h1: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: [
      "https://blog.boot.dev/link1",
      "https://blog.boot.dev/link2",
      "https://blog.boot.dev/link3",
    ],
    image_urls: [
      "https://blog.boot.dev/image1.jpg",
      "https://blog.boot.dev/image2.jpg",
      "https://blog.boot.dev/image3.jpg",
    ],
  };

  expect(actual).toEqual(expected);
});

test("extract_page_data main section priority", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `
    <html><body>
      <nav><p>Navigation paragraph</p></nav>
      <main>
        <h1>Main Title</h1>
        <p>Main paragraph content.</p>
      </main>
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  expect(actual.h1).toEqual("Main Title");
  expect(actual.first_paragraph).toEqual("Main paragraph content.");
});
