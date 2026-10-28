
import "dotenv/config";

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import sequelize from "./config/database.js";
import "./models/index.js";
import "./models/associations.model.js";
import Routes from "./routes/index.js";

const app = express();

// Parse incoming JSON requests.
app.use(express.json());

//cors
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://skillbridge-backend-78ix.onrender.com",
  ],
}));

// API health check.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillBridge API",
    version: "1.0.0",
    status: "Running",
  });
});

// Swagger documentation.
app.use(  "/api-docs",  swaggerUi.serve,  swaggerUi.setup(swaggerSpec));

// Expose the OpenAPI specification as a JSON file.
app.get("/api-docs.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});

// Mount API routes.
app.use("/api/v1", Routes);

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Error handler must remain last.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Verify that PostgreSQL is reachable before starting the API.
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

    // Exit with a failure status so deployment platforms can detect it.
    process.exit(1);
  }
}

startServer();
