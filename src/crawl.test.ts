import { expect, test } from "vitest";
import { getFirstParagraphFromHTML, getH1FromHTML, getImagesFromHTML, getURLsFromHTML, normalizeURL } from "./crawl";

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
  const expected = ["https://blog.boot.dev/courses", "https://blog.boot.dev/stinky"];

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


