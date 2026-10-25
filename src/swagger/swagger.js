import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SkillBridge API",
      version: "1.0.0",
      description: "API documentation for SkillBridge backend",
    },
    servers: [
      {
        url: "http://localhost:5007",
        description: "Local development server",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const swagger = {
  swaggerUi,
  swaggerSpec,
};

export default swagger;