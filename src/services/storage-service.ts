import fs from "fs";
import path from "path";

import CONFIG from "~/config/config";

import type { ProcessedDataFile } from "~/types";

// If this file is moved the Project root should be updated accordingly.
const PROJECT_ROOT = path.join(__dirname, "../..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, CONFIG.DEFAULT_ETL_DIRS.OUTPUT);

// Utility functions
export function createDirectoryIfNotExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Attempts to fix malformed JSON content by adding missing leading/trailing braces or brackets.
 */
function attemptFixJson(content: string) {
  let fixed = content.trim();

  // Add missing trailing brace/bracket
  if (fixed.startsWith("{") && !fixed.endsWith("}")) {
    fixed = fixed + "}";
  } else if (fixed.startsWith("[") && !fixed.endsWith("]")) {
    fixed = fixed + "]";
  } else if (!fixed.startsWith("{") && !fixed.startsWith("[")) {
    // If neither, wrap in braces
    fixed = "{" + fixed + "}";
  }

  // Add missing leading brace/bracket
  if (!fixed.startsWith("{") && fixed.endsWith("}")) {
    fixed = "{" + fixed;
  } else if (!fixed.startsWith("[") && fixed.endsWith("]")) {
    fixed = "[" + fixed;
  }

  return fixed;
}

function writeJsonFile<T>(filePath: string, data: T) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Core storage functions
export function saveProcessedDataToFile<T>(data: T[], outputDir = OUTPUT_DIR) {
  // Ensure the directories exist
  createDirectoryIfNotExists(outputDir);

  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const recordsPath = path.join(outputDir, `processed_at_${timestamp}.json`);

  const dataToSave = {
    processed_at: timestamp,
    count: data.length,
    data,
  } satisfies ProcessedDataFile<T>;

  writeJsonFile(recordsPath, dataToSave);
}

// Utility to read all JSON files from a directory
export function readJsonFilesFromDir(dirPath: string) {
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

  return files
    .map((file) => {
      const filePath = path.join(dirPath, file);
      if (!fs.existsSync(filePath)) return null;
      const content = fs.readFileSync(filePath, "utf-8");

      const fixedContent = attemptFixJson(content);

      try {
        return JSON.parse(fixedContent);
      } catch (error) {
        if (error instanceof Error) {
          if (error instanceof SyntaxError) {
            console.warn(
              `Failed to parse JSON in ${filePath}: ${error.message}`
            );
          } else {
            console.warn(`Unexpected error in ${filePath}: ${error.message}`);
          }
        }
        console.warn(`Skipping invalid JSON file: ${filePath}`);
      }
    })
    .filter(Boolean);
}
