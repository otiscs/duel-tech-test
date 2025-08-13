import CONFIG from "~/config/config";
import { saveProcessedUsersToDB } from "~/services/database-service";
import { saveProcessedDataToFile } from "~/services/storage-service";

import type { User } from "~/types";

export default async function saveProcessedUsers(
  users: User[],
  outputDir?: string
) {
  if (CONFIG.APP_ENV === "production") {
    await saveProcessedUsersToDB(users);
  } else {
    saveProcessedDataToFile(users, outputDir);
  }
}
