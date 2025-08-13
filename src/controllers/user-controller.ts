import { Request, Response } from "express";

import { tryCatch } from "~/lib/try-catch";
import {
  getDataStats,
  getUserById,
  getUsersPaginated,
  searchUsers,
} from "~/services/database-service";

import type { PaginatedResult, User } from "~/types";

export const getUsers = async (req: Request, res: Response) => {
  const { data, error } = await tryCatch(async () => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    return await getUsersPaginated(page, limit);
  });

  if (error) {
    return res.status(500).json({
      message: "Error fetching users",
      error: error.message || "Unknown error",
    });
  }

  res.json({
    data: {
      items: data?.items || [],
      total: data?.total || 0,
      page: data?.page || 1,
      totalPages: data?.totalPages || 0,
    } satisfies PaginatedResult<User>,
  });
};

export const getUserByIdHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  const { data, error } = await tryCatch(() => getUserById(userId));

  if (error) {
    return res.status(500).json({
      message: "Error fetching user",
      error: error?.message || "Unknown error",
    });
  }

  if (!data) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json({
    data: data,
  });
};

export const searchUsersHandler = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({
      message: "Search query is required",
    });
  }

  const { data, error } = await tryCatch(() => searchUsers(query));

  if (error) {
    return res.status(500).json({
      message: "Error searching users",
      error: error?.message || "Unknown error",
    });
  }

  res.json({
    data: {
      users: data || [],
      count: data?.length || 0,
      query,
    },
  });
};

export const getStatsHandler = async (req: Request, res: Response) => {
  const { data, error } = await tryCatch(() => getDataStats());

  if (error) {
    return res.status(500).json({
      message: "Error fetching statistics",
      error: error?.message || "Unknown error",
    });
  }

  res.json({
    data: data,
  });
};
