import * as fs from "node:fs";
import * as path from "node:path";
import { ExtractedPageData } from "./crawl";

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

export function writeCSVReport2(
  pageData: Record<string, ExtractedPageData | unknown>,
  filename = "report.csv",
): void {
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

  const rows: string[] = [];
  rows.push(headers.join(","));

  const keys = Object.keys(pageData).sort();

  let skipped = 0;

  for (const key of keys) {
    const raw = (pageData as Record<string, any>)[key];

    if (!raw || typeof raw !== "object") {
      skipped++;
      continue;
    }

    const url = typeof raw.url === "string" ? raw.url : key;
    const h1 = typeof raw.h1 === "string" ? raw.h1 : "";
    const first =
      typeof raw.first_paragraph === "string" ? raw.first_paragraph : "";

    const outgoing = Array.isArray(raw.outgoing_links)
      ? (raw.outgoing_links as string[])
      : [];
    const images = Array.isArray(raw.image_urls)
      ? (raw.image_urls as string[])
      : [];

    const values = [url, h1, first, outgoing.join(";"), images.join(";")].map(
      csvEscape,
    );

    rows.push(values.join(","));
  }

  const filePath = path.resolve(process.cwd(), filename);
  fs.writeFileSync(filePath, rows.join("\n"), { encoding: "utf-8" });

  if (skipped > 0) {
    console.log(
      `Report written to ${filePath} (skipped ${skipped} malformed row${skipped === 1 ? "" : "s"})`,
    );
  } else {
    console.log(`Report written to ${filePath}`);
  }
}

function csvEscape(field: string) {
  const str = field ?? "";
  const needsQuoting = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}
