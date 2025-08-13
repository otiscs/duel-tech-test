import { Server } from "http";

import { closeDatabaseConnection } from "~/services/database-service";

export default function setupGracefulShutdown(server: Server) {
  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => {
      console.log("HTTP server closed");
    });
    await closeDatabaseConnection();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
