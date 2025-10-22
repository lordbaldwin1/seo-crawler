import express from "express";
import { middlewareLogResponses } from "./middleware";
import { config } from "./config";

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);

const server = app.listen(config.port, () => {
    console.log(`listening on ${config.baseURL}:${config.port}`);
})