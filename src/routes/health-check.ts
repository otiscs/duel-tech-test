import { Request, Response } from "express";

import CONFIG from "~/config/config";

export default function createHealthCheckHandler(req: Request, res: Response) {
  let environment: string;
  if (
    CONFIG.APP_ENV === "production" &&
    process.env.NODE_ENV === "production"
  ) {
    environment = "production";
  } else if (CONFIG.APP_ENV !== process.env.NODE_ENV) {
    environment = "Error: Environment mismatch";
  } else {
    environment = "development";
  }

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment,
    version: CONFIG.VERSION,
  });
}
