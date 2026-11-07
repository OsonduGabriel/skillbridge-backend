
import express from "express";
import cors from "cors";
import swaggerSpec from "./swagger/swagger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import "./models/index.js";
import "./models/associations.model.js";
import Routes from "./routes/index.js";

const app = express();

app.use(express.json());

// Configure CORS to allow requests from the frontend.
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://skillbridge-weld.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
if (process.env.CLOUDFLARE_WORKER === "true") {
  // Cloudflare-compatible Swagger UI using the CDN.
  app.get("/api-docs", (req, res) => {
    res.type("html").send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SkillBridge API Documentation</title>
          <link rel="stylesheet"
            href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
          <script>
            SwaggerUIBundle({
              url: "/api-docs.json",
              dom_id: "#swagger-ui"
            });
          </script>
        </body>
      </html>
    `);
  });
} else {
  // Keep the existing Swagger UI implementation on Render.
  const { default: swaggerUi } = await import("swagger-ui-express");

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
}

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
