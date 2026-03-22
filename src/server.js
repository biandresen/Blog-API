import "dotenv/config";
import app from "./app.js";
import "./config/prismaClient.js";
import moderationService from "./services/moderationService.js";

const port = process.env.PORT || 4000;

app.set("trust proxy", 1);

async function startServer() {
  try {
    await moderationService.loadModerationTerms();

    const cacheMeta = moderationService.getModerationCacheMeta();
    console.log(
      `Moderation cache loaded: ${cacheMeta.count} active terms`
    );

    app.listen(port, "127.0.0.1", () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on http://127.0.0.1:${port}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();