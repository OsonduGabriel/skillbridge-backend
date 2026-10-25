
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "SkillBridge API",
      version: "1.0.0",
      description:
        "API documentation and testing interface for the SkillBridge backend.",
    },

    servers: [
      {
        url: "http://localhost:5007",
        description: "Local development server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT access token. Do not include the word Bearer.",
        },
      },
    },

    tags: [
      {
        name: "Authentication",
        description: "Registration, login, and password recovery",
      },
      {
        name: "Users",
        description: "User account management and administration",
      },
      {
        name: "Profile",
        description: "User profile management",
      },
      {
        name: "CV",
        description: "CV upload and analysis",
      },
      {
        name: "Skill Gap",
        description: "Skill gap analysis",
      },
      {
        name: "Skills",
        description: "Skill catalogue and user skills management",
      },
      {
        name: "Career Matching",
        description: "Career and opportunity matching",
      },
      {
        name: "Career Roadmap",
        description: "Learning roadmap management",
      },
      {
        name: "Opportunities",
        description: "Career opportunity management",
      },
      {
        name: "Progress",
        description: "User learning progress tracking",
      },
      {
        name: "Recommendations",
        description: "Career and learning recommendations",
      },
    ],
  },

  // swagger.js is in src/swagger.
  // Route files are in src/routes.
  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
