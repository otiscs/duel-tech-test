import CONFIG from "~/config/config";

import { RouteConfig, type RouteMap } from "./routes";

/**
 * Builds a RouteMap for enabled features in production.
 */
export function getEnabledFeatureRouteMap(featureRoutes: RouteMap) {
  return CONFIG.AVAILABLE_FEATURES
    ? (Object.fromEntries(
        CONFIG.AVAILABLE_FEATURES.filter(
          (feature) => featureRoutes[feature]
        ).map((feature) => [feature, featureRoutes[feature]])
      ) as RouteMap)
    : {};
}

/**
 * Flattens an array of RouteMap's into an array of route objects with full paths.
 * The Key of the route is the feature name (e.g. "USERS", "ETL"), which is used as the base path
 *
 * @param routeMap The map of route keys to route configs.
 * @returns
 */
export function flattenRouteMap(routeMap: RouteMap[], parentPath = "") {
  const routes = [] as RouteConfig[];
  let apiDocsRoute: RouteConfig | undefined;

  for (const map of routeMap) {
    for (const [key, value] of Object.entries(map)) {
      const sanitisedKey = key.toLowerCase().replace(/_/g, "-");
      const basePath = parentPath.length
        ? `${parentPath}/${sanitisedKey}`
        : `/${sanitisedKey}`;

      if (Array.isArray(value)) {
        for (const config of value) {
          const routeObj = {
            ...config,
            path: `${basePath}${config.path}`,
          };
          if (sanitisedKey === "api-docs") {
            apiDocsRoute = routeObj;
          } else {
            routes.push(routeObj);
          }
        }
      } else if (typeof value === "object" && value !== null) {
        const nestedRoutes = flattenRouteMap(value, basePath);
        if (Array.isArray(nestedRoutes)) {
          routes.push(
            ...nestedRoutes.filter(
              (route) => route.path.indexOf("/api-docs") === -1
            )
          );
          const foundApiDoc = nestedRoutes.find(
            (route) => route.path.indexOf("/api-docs") !== -1
          );
          if (foundApiDoc) apiDocsRoute = foundApiDoc;
        }
      }
    }
  }

  return { routes: routes, docs: apiDocsRoute } as {
    routes: RouteConfig[];
    docs: RouteConfig | undefined;
  };
}
