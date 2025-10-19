import { expect, test } from "vitest";
import { normalizeURL } from "./crawl";

test("normalize URL happy cases", () => {
  const URLs = [
    "https://blog.boot.dev/path/",
    "https://blog.boot.dev/path",
    "http://blog.boot.dev/path/",
    "http://blog.boot.dev/path",
  ];

  for (const url of URLs) {
    expect(normalizeURL(url)).toBe("blog.boot.dev/path")
  }
});
