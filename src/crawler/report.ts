import * as fs from "node:fs";
import * as path from "node:path";
import { ExtractedPageData } from "./crawl";

export function generateReport(pageData: Record<string, ExtractedPageData>) {
  if (!pageData || Object.keys(pageData).length === 0) {
    return [] as ExtractedPageData[];
  }

  
}

export function writeCSVReport(
  pageData: Record<string, ExtractedPageData>,
  filename: string = "report.csv"
) {
  if (!pageData || Object.keys(pageData).length === 0) {
    console.log("No data to write to CSV");
    return;
  }

  const headers = [
    "page_url",
    "h1",
    "first_paragraph",
    "outgoing_link_urls",
    "image_urls",
  ];
  const rows: string[] = [headers.join(",")];

  Object.values(pageData).forEach((data) => {
    const escapedData = {
      page_url: data.url,
      h1: data.h1,
      first_paragraph: data.first_paragraph,
      outgoing_link_urls: data.outgoing_links.join(";"),
      image_urls: data.image_urls.join(";"),
    };
    rows.push(Object.values(escapedData).map(csvEscape).join(","));
  });
  
  const file = path.resolve(process.cwd(), filename);
  fs.writeFileSync(file, rows.join("\n"), "utf8");
}

function csvEscape(field: string) {
  const str = field ?? "";
  const needsQuoting = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}
