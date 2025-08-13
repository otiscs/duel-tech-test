import { Application } from "express";

import createApiDocsHandler from "~/routes/development/api-docs";
import { default as getRoutes, RouteConfig } from "~/routes/routes";

import { setupErrorHandling } from "./error-handling";
import { setupMiddlewares } from "./middlewares";

import type { RouteMethod } from "~/types";

function registerRoutes(routes: RouteConfig[], app: Application) {
  routes.map(({ path, method, handler }) => {
    app[method.toLowerCase() as RouteMethod](path, handler);
  });
}
function setupRoutes(app: Application) {
  const { routes, docs } = getRoutes();
  registerRoutes(routes, app);

  // register the API docs route
  if (docs) app.get(docs.path, createApiDocsHandler(routes));
}

export default function handleSetup(app: Application) {
  setupRoutes(app);

  setupMiddlewares(app);

  setupErrorHandling(app);
}
