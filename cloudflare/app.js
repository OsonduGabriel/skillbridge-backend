
import { createServer } from "node:http";
import { httpServerHandler } from "cloudflare:node";

let handlerPromise;

async function getExpressHandler(env) {
    if (!handlerPromise) {
        handlerPromise = (async () => {
            // Configure database and email environment before importing the app.
            process.env.DATABASE_URL = env.HYPERDRIVE.connectionString;
            process.env.CLOUDFLARE_WORKER = "true";
            process.env.BREVO_API_KEY = env.BREVO_API_KEY;
            process.env.MAIL_FROM = env.MAIL_FROM;

            // Import Express after environment configuration.
            const { default: app } = await import("../src/app.js");

            // Adapt Express to Cloudflare Workers.
            const server = createServer(app);

            return httpServerHandler(server);
        })();
    }

    return handlerPromise;
}

export async function handleExpressRequest(request, env) {
    const handler = await getExpressHandler(env);
    return handler.fetch(request, env);
}
