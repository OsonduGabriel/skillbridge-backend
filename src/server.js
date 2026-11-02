
import "dotenv/config";

import app from "./app.js";
import sequelize from "./config/database.js";
import "./models/index.js";
import "./models/associations.model.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    if (process.env.DB_SYNC === "true") {
      await sequelize.sync();
      console.log("Database models synchronized.");
    } else {
      console.log("Automatic database synchronization is disabled.");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`SkillBridge API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start SkillBridge API.");
    console.error(error);
    process.exit(1);
  }
}

startServer();