import express from "express";
import path from "path";
import { env } from "../env/server";
import { initializeBot } from "./bot";
import { cronJobsRouter, initCronJobs } from "./router/cronJobs";
import { dataExchangeRouter } from "./router/dataExchange";

const startApp = () => {
  const app = express();
  app.use(express.json());

  app.get("/", (_, res) => {
    res.send("CF Discord Bot");
  });

  app.use(
    "/assets",
    express.static(path.join(__dirname, "frontend_vite/dist/assets"))
  );

  app.get("/frontend", (_, res) => {
    res.sendFile(path.join(__dirname, "frontend_vite/dist/index.html"));
  });

  app.get("/health-check", (req, res) => {
    res.status(200).json({ endPoint: req.url });
  });

  app.use("/data-exchange", dataExchangeRouter);
  app.use("/cron-jobs", cronJobsRouter);

  app.listen(+env.PORT, "0.0.0.0", () => {
    console.log(`Example app listening on port ${env.PORT}`);

    if (env.START_DISCORD === "true") {
      initializeBot();
      initCronJobs();
    }
  });
};

startApp();
