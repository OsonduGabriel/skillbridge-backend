import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import sequelize from  "./config/database.js"
import "./models/index.js";
import Routes from "./routes/index.js"

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillBridge API",
    version: "1.0.0",
    status: "Running"
  });
});

//swagger doc
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//api routes
app.use("/api/v1", Routes)

//404 middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

//error handler
app.use(errorHandler)

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Create tables (development only)
    await sequelize.sync({ alter: true });
    console.log("Models synchronized.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database.");
    console.error(error.message);
  }
}

startServer();