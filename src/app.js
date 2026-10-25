
import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import sequelize from "./config/database.js";
import "./models/index.js";
import "./models/associations.model.js";
import Routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillBridge API",
    version: "1.0.0",
    status: "Running",
  });
});

// Swagger documentation
app.use( "/api-docs",  swaggerUi.serve,  swaggerUi.setup(swaggerSpec));

// API routes: mounted once through the central router.
app.use("/api/v1", Routes);

// 404 middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Error handler must remain last.
app.use(errorHandler);

const PORT = process.env.PORT || 5007;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Keep your existing development synchronization behavior.
    await sequelize.sync();
    console.log("Models synchronized.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server or connect to the database.");
    console.error(error);
    process.exitCode = 1;
  }
}

startServer();
