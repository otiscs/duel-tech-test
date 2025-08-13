#!/usr/bin/env ts-node

import CONFIG from "~/config/config";
import { processLocalData } from "~/controllers/etl-controller";

const main = async () => {
  const args = {
    inputDir: process.argv[2] || CONFIG.DEFAULT_ETL_DIRS.INPUT,
    outputDir: process.argv[3] || CONFIG.DEFAULT_ETL_DIRS.OUTPUT,
  };

  try {
    const result = await processLocalData(args.inputDir, args.outputDir);
    console.log("ETL process completed successfully.");
    console.log("Stats:", result.stats);
  } catch (error) {
    console.error(
      "Error during ETL process:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}
