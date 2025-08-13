import { z } from "zod";

import {
  advocacyProgramSchema,
  inputAdvocacyProgramSchema,
  inputTaskSchema,
  inputUserSchema,
  taskSchema,
  userSchema,
} from "~/schemas/user";

export type InputAdvocacyProgram = z.infer<typeof inputAdvocacyProgramSchema>;
export type InputTask = z.infer<typeof inputTaskSchema>;
export type InputUser = z.infer<typeof inputUserSchema>;
export type InputSocialMediaHandle = z.infer<
  | (typeof inputUserSchema.shape)["tiktok_handle"]
  | (typeof inputUserSchema.shape)["instagram_handle"]
>;

export type User = z.infer<typeof userSchema>;
export type UserAdvocacyProgram = z.infer<typeof advocacyProgramSchema>;
export type UserTask = z.infer<typeof taskSchema>;

export type RouteMethod = "get" | "post" | "put" | "all";

// Pagination types
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type ProcessedDataFile<T> = {
  processed_at: string;
  count: number;
  data: T[];
};

export type FailedTransform = {
  record: InputUser;
  fileName: string;
  reason: string;
};
