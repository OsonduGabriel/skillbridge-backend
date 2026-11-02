import swaggerJsdoc from "swagger-jsdoc";
import fs from "node:fs";
import path from "node:path";
import schemas from "../src/swagger/schemas/index.js";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "SkillBridge Backend API",
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

const outputDirectory = path.resolve("cloudflare");
const outputFile = path.join(outputDirectory, "openapi.json");

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(swaggerSpec, null, 2));

console.log(`OpenAPI specification generated: ${outputFile}`);
console.log(
    `Documented endpoints: ${Object.keys(swaggerSpec.paths || {}).length}`
);