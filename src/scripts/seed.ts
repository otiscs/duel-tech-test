import fs from "fs";
import path from "path";

import CONFIG from "~/config/config";
import { PrismaClient } from "~/generated/prisma";
import { tryCatch } from "~/lib/try-catch";
import { closeDatabaseConnection } from "~/services/database-service";
import { User, UserAdvocacyProgram, UserTask } from "~/types";

const prisma = new PrismaClient();

// consider refactoring this to use createMany
async function saveProcessedUsersToDB(users: User[]) {
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
}

// Accept file path as command line argument or use default from config
const filePath =
  process.argv[2] || path.join(__dirname, CONFIG.DEFAULT_ETL_DIRS.OUTPUT);

async function main() {
  console.log(`Starting database seeding from: ${filePath}`);

  // Check if path exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Path does not exist: ${filePath}`);
    process.exit(1);
  }

  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Process the data
    const result = await tryCatch(saveProcessedUsersToDB(data));

    if (result.error) {
      console.error("Failed to save data to database:", result.error);
      process.exit(1);
    }

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    closeDatabaseConnection();
  });
