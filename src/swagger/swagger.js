import swaggerJsdoc from "swagger-jsdoc";
import schemas from "./schemas/index.js";
import generatedOpenApi from "../../cloudflare/openapi.json" with { type: "json" };

const isCloudflare = process.env.CLOUDFLARE_WORKER === "true";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "SkillBridge API",
      version: "1.0.0",
      description:
        "REST API for CV analysis, skill gap analysis, career matching, learning roadmaps, opportunities, and user progress tracking.",
    },

    servers: [
  {
    url: "https://skillbridge-api.tb-skillbridge-backend.workers.dev",
    description: "Cloudflare Workers - Production",
  },
  {
    url: "http://localhost:3000",
    description: "Local Development",
  },
],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token.",
        },
      },
      schemas,
    },

    parameters: {
      CVId: {
        name: "cvId",
        in: "path",
        required: true,
        description: "UUID of the CV.",
        schema: {
          type: "string",
          format: "uuid",
        },
        example: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = isCloudflare
  ? generatedOpenApi
  : swaggerJsdoc(options);

export default swaggerSpec;
