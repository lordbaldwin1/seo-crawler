import express, { Request } from "express";
import { middlewareErrorHandler, middlewareLogResponses } from "./middleware";
import { config } from "./config";
import { CrawlURLQueryParameters, handlerCrawlURL } from "./api/handlers";

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);

app.get(
  "/api/crawl",
  (req: Request<{}, {}, {}, CrawlURLQueryParameters>, res, next) => {
    Promise.resolve(handlerCrawlURL(req, res).catch(next));
  }
);

app.use(middlewareErrorHandler);

const server = app.listen(config.port, () => {
  console.log(`listening on ${config.baseURL}:${config.port}`);
});
