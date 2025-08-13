import { Request, Response } from "express";

import CONFIG from "~/config/config";
import { tryCatch } from "~/lib/try-catch";
import saveProcessedUsers from "~/services/save-service";
import {
  readJsonFilesFromDir,
  saveProcessedDataToFile,
} from "~/services/storage-service";
import {
  getTransformationStats,
  transformUsers,
} from "~/services/transformation-service";

import type { FailedTransform, InputUser } from "~/types";

const ERROR_STRINGS = {
  NO_RAW_DATA: "No data found to process",
  TRANSFORMATION_FAILED: "Transformation failed: invalid data structure",
  FALLBACK: "Unknown error occurred",
};
/**
 * Shared ETL pipeline logic for processing and saving users.
 */
export async function runEtlPipeline(
  inputUsers: InputUser[],
  outputDir?: string
) {
  if (!Array.isArray(inputUsers) || inputUsers.length === 0) {
    throw new Error(ERROR_STRINGS.NO_RAW_DATA);
  }

  const result = transformUsers(inputUsers);

  const { transformed, failed } = result;

  // Log failed records if any exist
  if (failed && failed.length > 0) {
    console.warn(
      `Failed to transform ${failed.length} records out of ${inputUsers.length}`
    );

    // If outputDir provided (local running of the ETL process) save failed records to a file
    outputDir && saveProcessedDataToFile<FailedTransform>(failed, outputDir);
  }

  // save processed users
  await saveProcessedUsers(transformed, outputDir);

  const stats = getTransformationStats(inputUsers.length, transformed.length);

  return {
    stats,
    processedAt: new Date().toISOString(),
    failedRecords: failed,
    failedCount: failed.length,
  };
}

/**
 * Process raw user data through ETL pipeline via POST /process
 */
export const processData = async (req: Request, res: Response) => {
  const { data, error } = await tryCatch(async () => {
    return await runEtlPipeline(req.body);
  });

  if (error) {
    const errorMessage = error?.message || "Unknown error";
    if (errorMessage === ERROR_STRINGS.NO_RAW_DATA) {
      return res.status(404).json({ message: errorMessage });
    }

    return res
      .status(500)
      .json({ message: "Error processing data", error: errorMessage });
  }

  res.json({ ...data });
};

/**
 * Process local raw user data through ETL pipeline (for script usage)
 */
export const processLocalData = async (
  inputDir = CONFIG.DEFAULT_ETL_DIRS.INPUT,
  outputDir?: string
) => {
  const { data, error } = await tryCatch(async () => {
    const inputUsers = readJsonFilesFromDir(inputDir);

    // Pass outputDir to runEtlPipeline for failed records logging
    return await runEtlPipeline(inputUsers, outputDir);
  });

  if (error) throw new Error(error?.message || "Error processing local data");

  return data;
};
