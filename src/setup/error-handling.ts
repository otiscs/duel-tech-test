import express from "express";

import CONFIG from "~/config/config";

const createErrorHandler =
  () =>
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const message =
      CONFIG.APP_ENV === "production" ? "Internal server error" : error.message;

    if (CONFIG.APP_ENV !== "production") {
      console.error("Error:", error);
    }

    res.status(500).json({
      message,
      ...(CONFIG.APP_ENV !== "production" && { stack: error.stack }),
    });
    next();
  };

export const setupErrorHandling = (app: express.Application) => {
  app.use(createErrorHandler());
};
