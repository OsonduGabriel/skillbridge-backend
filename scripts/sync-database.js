
import "dotenv/config";

import sequelize from "../src/config/database.js";
import "../src/models/index.js";
import "../src/models/associations.model.js";

async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log("Connected to Supabase PostgreSQL.");

        await sequelize.sync();

        console.log("Database tables created successfully.");
    } catch (error) {
        console.error("Database synchronization failed:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
