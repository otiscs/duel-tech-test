import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";

import CONFIG from "~/config/config";

export const setupSecurityMiddlewares = (app: Application): void => {
  // Use helmet for security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: Boolean(CONFIG.APP_ENV === "production"),
      credentials: true,
    })
  );
};

// Use morgan for logging HTTP requests
export const setupLoggingMiddleware = (app: Application): void => {
  // morgan's development format is "dev" not "development"
  const logFormat = CONFIG.APP_ENV === "production" ? "combined" : "dev";
  app.use(morgan(logFormat));
};

// add a limit
export const setupBodyParsingMiddlewares = (app: Application): void => {
  app.use(express.json({ limit: `${CONFIG.JSON_PARSE_LIMIT_IN_MB}mb` }));
  app.use(
    express.urlencoded({
      extended: true,
      limit: `${CONFIG.JSON_PARSE_LIMIT_IN_MB}mb`,
    })
  );
};

export const setupMiddlewares = (app: Application): void => {
  setupSecurityMiddlewares(app);
  setupLoggingMiddleware(app);
  setupBodyParsingMiddlewares(app);
};
