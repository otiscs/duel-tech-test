import { Request, Response } from "express";

import CONFIG from "~/config/config";
import { RouteConfig } from "~/routes/routes";

export default function createApiDocsHandler(routes: RouteConfig[]) {
  return (req: Request, res: Response) => {
    const endpoints: Record<string, string> = {};
    for (const route of routes) {
      // Convert method to uppercase for readability
      const method = route.method.toUpperCase();
      endpoints[`${method} ${route.path}`] = route.description || "";
    }
    res.json({
      message: "User Data ETL API",
      version: CONFIG.VERSION,
      enabled_endpoints: endpoints,
    });
  };
}
