import { crawlPage, getHTML } from "./crawl";

async function main() {
    if (process.argv.length < 3) {
        console.log("no website provided");
        process.exit(1);
      }
      if (process.argv.length > 3) {
        console.log("too many arguments provided");
        process.exit(1);
      }
    const baseURL = process.argv[2];

    console.log("crawler starting at:", baseURL);

    const pages = await crawlPage(baseURL);
    console.log(pages);

    process.exit(0);
}

main();