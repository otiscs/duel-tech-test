import express, { Application } from "express";

import setupGracefulShutdown from "./lib/graceful-shutdown";
import handleSetup from "./setup";

const startServer = (app: Application) => {
  const port = process.env.PORT || 3000;
  const nodeEnv = process.env.NODE_ENV || "development";

  const server = app.listen(port, () => {
    if (nodeEnv !== "production") {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${nodeEnv}`);
      console.log(`Health check endpoint: /health`);
      console.log(`API docs endpoint: /api`);
    }
  });

  setupGracefulShutdown(server);

  return server;
};

const createApp = () => {
  const app = express();

  handleSetup(app);

  startServer(app);

  return app;
};

createApp();
