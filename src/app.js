
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import "./models/index.js";
import "./models/associations.model.js";
import Routes from "./routes/index.js";

const app = express();

// Parse incoming JSON requests.
app.use(express.json());

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
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

// Expose the OpenAPI specification as JSON.
app.get("/api-docs.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});

// Mount all existing API routes.
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

export default app;
