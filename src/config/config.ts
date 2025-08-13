import CONFIG from "./config.json";

export type AvailableFeatures = "ETL" | "USERS";

// Any changes here or to the config json file should be reflected here
export type AppConfig = {
  VERSION: string;
  APP_ENV: "development" | "production" | "test";
  JSON_PARSE_LIMIT_IN_MB: number;
  AVAILABLE_FEATURES?: AvailableFeatures[];
  SUPPORTED_ADVOCACY_PLATFORMS: ReadonlyArray<string>;
  DEFAULT_ETL_DIRS: {
    INPUT: string;
    OUTPUT: string;
    FAILED: string;
  };
};

if (CONFIG.APP_ENV !== "production" || process.env.NODE_ENV !== "production") {
  console.info("App configuration:", CONFIG);
}

export default CONFIG as AppConfig;
