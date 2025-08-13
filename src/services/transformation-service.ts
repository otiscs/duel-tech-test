import { formatISO, isValid, parseISO } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

import {
  advocacyProgramSchema,
  inputUserSchema,
  taskSchema,
  userSchema,
} from "~/schemas/user";

import type {
  FailedTransform,
  InputAdvocacyProgram,
  InputSocialMediaHandle,
  InputTask,
  InputUser,
  User,
  UserAdvocacyProgram,
  UserTask,
} from "~/types";

type TransformationResult = {
  transformed: User[];
  failed: FailedTransform[];
};

const generateOrValidateUUID = (value: string | null) => {
  const parsedUuid = z.uuid().safeParse(value);

  return parsedUuid.success ? parsedUuid.data : uuidv4();
};

// Name cleaning utilities
const cleanName = (value: string) => {
  if (value.trim().length > 0 && value !== "???") {
    return value;
  }

  return null;
};

const cleanEmail = (value: InputUser["email"]) => {
  if (typeof value === "string" && value !== "invalid-email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return value.toLowerCase().trim();
    }
  }

  return null;
};

const cleanSocialHandle = (value: InputSocialMediaHandle) => {
  if (
    typeof value === "string" &&
    value !== "#error_handle" &&
    value.trim().length > 0
  ) {
    let cleaned = value.trim();
    if (!cleaned.startsWith("@")) {
      cleaned = "@" + cleaned;
    }

    return cleaned;
  }

  return null;
};

// Date utilities
const cleanDateTime = (value: string | null) => {
  if (value === null || value === "not-a-date") return null;

  const isoDateTime = z.iso.datetime().safeParse(value);
  if (isoDateTime.success) return isoDateTime.data;

  if (isoDateTime.error) {
    const parsedDate = parseISO(value);
    if (isValid(parsedDate))
      return formatISO(parsedDate, { representation: "complete" });
  }

  return null;
};

// Numeric utilities
const cleanNumericField = (value: number | string | null) => {
  if (typeof value === "number" && !isNaN(value)) return value;

  if (typeof value === "string") {
    if (value === "NaN" || value.trim() === "") return null;

    const parsed = parseFloat(value);

    if (!isNaN(parsed)) return parsed;
  }

  return null;
};

const cleanSalesData = (
  value: InputAdvocacyProgram["total_sales_attributed"]
) => {
  if (value === "no-data") return null;

  return cleanNumericField(value);
};

// Brand utilities
const cleanBrand = (value: InputAdvocacyProgram["brand"]) => {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  if (typeof value === "number") return value.toString();

  return null;
};

// Platform utilities
const cleanPlatform = (value: InputTask["platform"]) => {
  return value.toString().trim().toLowerCase();
};

// URL utilities
const cleanUrl = (value: string): string | null => {
  if (
    typeof value === "string" &&
    value !== "broken_link" &&
    value.trim().length > 0
  ) {
    try {
      new URL(value);

      return value;
    } catch {
      return null;
    }
  }

  return null;
};

// Task transformation
const transformTask = (task: InputTask) => {
  try {
    const transformed = {
      task_id: generateOrValidateUUID(task.task_id),
      platform: cleanPlatform(task.platform),
      post_url: cleanUrl(task.post_url),
      likes: cleanNumericField(task.likes),
      comments: cleanNumericField(task.comments),
      shares: cleanNumericField(task.shares) ?? 0,
      reach: cleanNumericField(task.reach) ?? 0,
    };

    const result = taskSchema.safeParse(transformed);

    return result.success ? (result.data as UserTask) : null;
  } catch {
    return null;
  }
};

const transformTasks = (tasks: InputTask[]) => {
  if (!Array.isArray(tasks)) return [];

  return tasks.map(transformTask).filter((task) => task !== null);
};

// Advocacy program transformation
const transformAdvocacyProgram = (program: InputAdvocacyProgram) => {
  try {
    const transformed = {
      program_id: generateOrValidateUUID(program.program_id),
      brand: cleanBrand(program.brand),
      tasks_completed: transformTasks(program.tasks_completed),
      total_sales_attributed: cleanSalesData(program.total_sales_attributed),
    } satisfies UserAdvocacyProgram;

    const result = advocacyProgramSchema.safeParse(transformed);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

const transformAdvocacyPrograms = (programs: InputAdvocacyProgram[]) => {
  if (!Array.isArray(programs)) return null;

  const transformed = programs
    .map(transformAdvocacyProgram)
    .filter((program) => program !== null);

  return transformed ? transformed : null;
};

// User transformation
export const transformUser = (inputUser: InputUser) => {
  // First validate against input schema to determine if the user data can be parsed
  const inputValidation = inputUserSchema.safeParse(inputUser);

  if (!inputValidation.success) return { error: inputValidation.error };

  const validatedInput = inputValidation.data;

  // Transform the data
  const transformed = {
    user_id: generateOrValidateUUID(validatedInput.user_id),
    name: cleanName(validatedInput.name),
    email: cleanEmail(validatedInput.email),
    instagram_handle: cleanSocialHandle(validatedInput.instagram_handle),
    tiktok_handle: cleanSocialHandle(validatedInput.tiktok_handle),
    joined_at: cleanDateTime(validatedInput.joined_at),
    advocacy_programs: transformAdvocacyPrograms(
      validatedInput.advocacy_programs
    ),
  } satisfies User;

  // Validate transformed data against output schema
  const outputValidation = userSchema.safeParse(transformed);

  return outputValidation.success
    ? outputValidation.data
    : { error: outputValidation.error };
};

// Batch transformation
const transformUsers = (inputUsers: InputUser[]) => {
  const transformed = [] as User[];
  const failed = [] as FailedTransform[];

  if (!Array.isArray(inputUsers)) return { transformed, failed };

  for (const inputUser of inputUsers) {
    const result = transformUser(inputUser);
    if (typeof result === "object" && "error" in result) {
      failed.push({
        record: inputUser,
        reason: z.prettifyError(result.error),
        fileName: `failed_record_${inputUser.user_id}.json`,
      });
    } else {
      transformed.push(result as User);
    }
  }

  return { transformed, failed } as TransformationResult;
};

// Utility functions for statistics
const getTransformationStats = (inputCount: number, outputCount: number) => ({
  inputRecords: inputCount,
  outputRecords: outputCount,
  successRate:
    inputCount > 0 ? ((outputCount / inputCount) * 100).toFixed(2) + "%" : "0%",
  failedRecords: inputCount - outputCount,
});

export {
  cleanNumericField,
  cleanPlatform,
  cleanSalesData,
  cleanSocialHandle,
  cleanUrl,
  generateOrValidateUUID,
  getTransformationStats,
  transformAdvocacyProgram,
  transformAdvocacyPrograms,
  transformTask,
  transformTasks,
  transformUsers,
};
