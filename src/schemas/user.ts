import { z } from "zod";

const inputSocialMediaHandle = z.string().or(z.literal("#error_handle"));

// INPUT SCHEMAS
export const inputTaskSchema = z.object({
  task_id: z.uuid().nullable().or(z.string().length(0)),
  platform: z.number().or(z.string()),
  post_url: z.string(),
  likes: z.union([z.number(), z.literal("NaN")]),
  comments: z.number().nullable(),
  shares: z.number(),
  reach: z.number(),
});

export const inputAdvocacyProgramSchema = z.object({
  program_id: z.string().nullable().or(z.string().length(0)),
  brand: z.union([z.string(), z.number()]),
  tasks_completed: z.array(inputTaskSchema),
  total_sales_attributed: z.number().or(z.literal("no-data")),
});

export const inputUserSchema = z.object({
  user_id: z.uuid().nullable(),
  name: z.string(),
  email: z.email().or(z.literal("invalid-email")),
  instagram_handle: inputSocialMediaHandle.nullable(),
  tiktok_handle: inputSocialMediaHandle,
  joined_at: z.iso.datetime().or(z.literal("not-a-date")),
  advocacy_programs: z.array(inputAdvocacyProgramSchema),
});

// OUTPUT SCHEMAS
export const taskSchema = z.object({
  task_id: z.uuid(),
  platform: z.string(),
  post_url: z.url().nullable(),
  likes: z.number().nullable(),
  comments: z.number().nullable(),
  shares: z.number(),
  reach: z.number(),
});

export const advocacyProgramSchema = z.object({
  program_id: z.uuid(),
  brand: z.string().nullable(),
  tasks_completed: z.array(taskSchema),
  total_sales_attributed: z.number().nullable(),
});

export const userSchema = z.object({
  user_id: z.uuid(),
  name: z.string().nullable(),
  email: z.email().nullable(),
  instagram_handle: z.string().nullable(),
  tiktok_handle: z.string().nullable(),
  joined_at: z.iso.datetime().nullable(),
  advocacy_programs: z.array(advocacyProgramSchema).nullable(),
});
