import CONFIG from "~/config/config";
import { processData } from "~/controllers/etl-controller";
import {
  getStatsHandler,
  getUserByIdHandler,
  getUsers,
  searchUsersHandler,
} from "~/controllers/user-controller";

import createApiDocsHandler from "./development/api-docs";
import createHealthCheckHandler from "./health-check";
import { flattenRouteMap, getEnabledFeatureRouteMap } from "./helpers";
import create404Handler from "./not-found";

import type { RequestHandler } from "express";
import type { RouteMethod } from "~/types";

export type RouteMap = {
  [key: string]: RouteConfig[];
};

export type RouteConfig = {
  /*
   * The path for the route (e.g. /users)
   * it is generated from the KEY of the route, so for getUsers the path is "/users"
   *
   */
  path: string;
  /*
   * The HTTP method for the route (get, post, etc.)
   */
  method: RouteMethod;
  /*
   * The handler for the route
   * typically a RequestHandler, though the docs api generates the docs based on the enabled routes
   */
  handler: RequestHandler | ((routes: RouteConfig[]) => RequestHandler);
  /*
   * A brief description of the route, this will be displayed by the api-docs endpoint
   */
  description?: string;
};

const CORE_ROUTES = {
  HEALTH: [
    {
      path: "/",
      method: "get",
      handler: createHealthCheckHandler,
      description: "Health check endpoint",
    },
  ],
  NOT_FOUND: [
    {
      path: "/*splat",
      method: "all",
      handler: create404Handler,
      description: "404 Not Found",
    },
  ],
} satisfies RouteMap;

export const FEATURE_ROUTES = {
  USERS: [
    {
      path: "/",
      method: "get",
      handler: getUsers,
      description: "Get all users",
    },
    {
      path: "/search",
      method: "get",
      handler: searchUsersHandler,
      description: "Search for users",
    },
    {
      path: "/stats",
      method: "get",
      handler: getStatsHandler,
      description: "Get user statistics",
    },
    {
      path: "/:userId",
      method: "get",
      handler: getUserByIdHandler,
      description: "Get user by ID",
    },
  ],
  ETL: [
    {
      path: "/process",
      method: "post",
      handler: processData,
      description: "Process raw user data",
    },
  ],
} satisfies RouteMap;

export const API_DOCS_ROUTE = "/api-docs";

const DEVELOPMENT_ROUTES = {
  API_DOCS: [
    {
      path: "/",
      method: "get",
      handler: createApiDocsHandler,
      description: "API documentation",
    },
  ],
} satisfies RouteMap;

export default function getRoutes() {
  const flattenedRoutesAndDocs = flattenRouteMap(
    [
      CORE_ROUTES,
      CONFIG.AVAILABLE_FEATURES && getEnabledFeatureRouteMap(FEATURE_ROUTES),
      CONFIG.APP_ENV !== "production" && DEVELOPMENT_ROUTES,
    ].filter(Boolean) as RouteMap[]
  );

  const { routes, docs } = flattenedRoutesAndDocs;

  // When registering the docs route, pass the routes array
  return { routes, docs };
}
