import express from "express";
import { middlewareErrorHandler, middlewareLogResponses } from "./middleware";
import { config } from "./config";

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);

// handlers

app.use(middlewareErrorHandler);

const server = app.listen(config.port, () => {
    console.log(`listening on ${config.baseURL}:${config.port}`);
})