
import { createServer } from "node:http";
import { httpServerHandler } from "cloudflare:node";
import { runWithCloudflareContext } from "../src/utils/cloudflare-context.js";

let handlerPromise;

// Initialize Express once and configure the Worker environment
// before importing the Express application.
async function getExpressHandler(env) {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      if (!env.HYPERDRIVE?.connectionString) {
        throw new Error("Missing Cloudflare Hyperdrive connection");
      }

      // Configure database connection.
      process.env.DATABASE_URL =
        env.HYPERDRIVE.connectionString;

      // Identify the Cloudflare Worker environment.
      process.env.CLOUDFLARE_WORKER = "true";

      // Forward Brevo email configuration.
      if (env.BREVO_API_KEY) {
        process.env.BREVO_API_KEY = env.BREVO_API_KEY;
      }

      if (env.MAIL_FROM) {
        process.env.MAIL_FROM = env.MAIL_FROM;
      }

      // Forward authentication configuration.
      if (env.JWT_SECRET) {
        process.env.JWT_SECRET = env.JWT_SECRET;
      }

      if (env.JWT_EXPIRES_IN) {
        process.env.JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
      }

      // Forward Gemini API key to the AI service.
      if (env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      }

      // Import Express only after environment configuration.
      const { default: app } = await import("../src/app.js");

      // Adapt Express to Cloudflare Workers.
      const server = createServer(app);

      return httpServerHandler(server);
    })().catch((error) => {
      // Allow a future request to retry initialization.
      handlerPromise = undefined;
      throw error;
    });
  }

  return handlerPromise;
}

// Forward incoming requests to Express.
export async function handleExpressRequest(request, env) {
  const handler = await getExpressHandler(env);

  return runWithCloudflareContext(env, () =>
    handler.fetch(request, env)
  );
}
