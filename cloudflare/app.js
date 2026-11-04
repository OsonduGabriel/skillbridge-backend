
import { createServer } from "node:http";
import { httpServerHandler } from "cloudflare:node";

let handlerPromise;

async function getExpressHandler(env) {
    if (!handlerPromise) {
        handlerPromise = (async () => {
            if (!env.HYPERDRIVE?.connectionString) {
                throw new Error("Missing Cloudflare Hyperdrive connection");
            }

            // Configure environment before importing Express.
            process.env.DATABASE_URL =
                env.HYPERDRIVE.connectionString;

            process.env.CLOUDFLARE_WORKER = "true";

            if (env.BREVO_API_KEY) {
                process.env.BREVO_API_KEY = env.BREVO_API_KEY;
            }

            if (env.MAIL_FROM) {
                process.env.MAIL_FROM = env.MAIL_FROM;
            }

            // Forward required authentication secrets.
            // Add these bindings to Cloudflare if your app uses them.
            if (env.JWT_SECRET) {
                process.env.JWT_SECRET = env.JWT_SECRET;
            }

            if (env.JWT_EXPIRES_IN) {
                process.env.JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
            }

            // Import Express after environment configuration.
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

export async function handleExpressRequest(request, env) {
    const handler = await getExpressHandler(env);

    return handler.fetch(request, env);
}
