import { PrismaClient } from "~/generated/prisma";

import type {
  AdvocacyProgram as PrismaAdvocacyProgram,
  Task as PrismaTask,
  User as PrismaUser,
} from "~/generated/prisma";
import type {
  PaginatedResult,
  User,
  UserAdvocacyProgram,
  UserTask,
} from "~/types";

const prisma = new PrismaClient();

// Convert data from Prisma data type to app types
const transformPrismaUser = (
  prismaUser: PrismaUser & {
    advocacy_programs: (PrismaAdvocacyProgram & {
      tasks: PrismaTask[];
    })[];
  }
) => ({
  user_id: prismaUser.id,
  name: prismaUser.name,
  email: prismaUser.email,
  instagram_handle: prismaUser.instagram_handle,
  tiktok_handle: prismaUser.tiktok_handle,
  joined_at: prismaUser.joined_at?.toISOString() || null,
  advocacy_programs:
    prismaUser.advocacy_programs?.map(
      (program): UserAdvocacyProgram => ({
        program_id: program.id,
        brand: program.brand,
        total_sales_attributed: program.total_sales_attributed,
        tasks_completed:
          program.tasks?.map(
            (task): UserTask => ({
              task_id: task.id,
              platform: task.platform,
              post_url: task.post_url,
              likes: task.likes,
              comments: task.comments,
              shares: task.shares,
              reach: task.reach,
            })
          ) || [],
      })
    ) || null,
});

// Save processed users to database
export const saveProcessedUsersToDB = async (users: User[]) => {
  // Insert new data
  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        instagram_handle: user.instagram_handle,
        tiktok_handle: user.tiktok_handle,
        joined_at: user.joined_at ? new Date(user.joined_at) : null,
        advocacy_programs: {
          create:
            user.advocacy_programs?.map((program: UserAdvocacyProgram) => ({
              id: program.program_id,
              brand: program.brand,
              totalSalesAttributed: program.total_sales_attributed,
              tasks: {
                create:
                  program.tasks_completed?.map((task: UserTask) => ({
                    id: task.task_id,
                    platform: task.platform,
                    postUrl: task.post_url,
                    likes: task.likes,
                    comments: task.comments,
                    shares: task.shares,
                    reach: task.reach,
                  })) || [],
              },
            })) || [],
        },
      },
    });
  }
};

// Load all processed users from database
export const loadProcessedUsers = async () => {
  const prismaUsers = await prisma.user.findMany({
    include: {
      advocacy_programs: {
        include: {
          tasks: true,
        },
      },
    },
  });

  return prismaUsers.map(transformPrismaUser);
};

// Get users with pagination
export const getUsersPaginated = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: offset,
      take: limit,
      include: {
        advocacy_programs: {
          include: {
            tasks: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    items: users.map(transformPrismaUser),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  } satisfies PaginatedResult<User>;
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const prismaUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      advocacy_programs: {
        include: {
          tasks: true,
        },
      },
    },
  });

  return prismaUser ? transformPrismaUser(prismaUser) : null;
};

// Search users by name, email. tiktok or instagram handle
export const searchUsers = async (query: string) => {
  const prismaUsers = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { instagram_handle: { contains: query, mode: "insensitive" } },
        { tiktok_handle: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      advocacy_programs: {
        include: {
          tasks: true,
        },
      },
    },
  });

  return prismaUsers.map(transformPrismaUser);
};

// Get data statistics
export const getDataStats = async () => {
  const [userCount, programCount, taskCount] = await Promise.all([
    prisma.user.count(),
    prisma.advocacyProgram.count(),
    prisma.task.count(),
  ]);

  const avgProgramsPerUser = userCount > 0 ? programCount / userCount : 0;
  const avgTasksPerProgram = programCount > 0 ? taskCount / programCount : 0;

  return {
    totalUsers: userCount,
    totalPrograms: programCount,
    totalTasks: taskCount,
    averageProgramsPerUser: Number(avgProgramsPerUser.toFixed(2)),
    averageTasksPerProgram: Number(avgTasksPerProgram.toFixed(2)),
  };
};

// Gracefully close database connection
export const closeDatabaseConnection = async () => {
  await prisma.$disconnect();
};
