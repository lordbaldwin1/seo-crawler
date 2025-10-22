import { crawlSiteAsync } from "./crawl";
import { writeCSVReport, writeCSVReport2 } from "./report";

async function main() {
  if (process.argv.length < 5) {
    console.log("# usage: npm run start <URL> <maxConcurrency> <maxPages>");
    process.exit(1);
  }
  if (process.argv.length > 5) {
    console.log("# usage: npm run start <URL> <maxConcurrency> <maxPages>");
    process.exit(1);
  }
  const baseURL = process.argv[2];
  const maxConcurrency = Number(process.argv[3]);
  const maxPages = Number(process.argv[4]);

  if (
    (maxConcurrency > 0 && !Number.isFinite(maxConcurrency)) ||
    (maxPages > 0 && !Number.isFinite(maxPages))
  ) {
    console.log(
      "maxConcurrency and maxPages must be valid, finite numbers greater than 0"
    );
    process.exit(1);
  }

  console.log("crawler starting at:", baseURL);

  const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

  writeCSVReport(pages);

  process.exit(0);
}

main();
