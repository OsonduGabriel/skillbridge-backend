
import swaggerJsdoc from "swagger-jsdoc";
import schemas from "./schemas/index.js";

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
        url: "http://localhost:3000",
        description: "Local development",
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

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
