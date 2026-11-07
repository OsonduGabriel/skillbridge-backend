import { Client } from "pg";
import { Sequelize } from "sequelize";
import pg from "pg";
import { handleExpressRequest } from "./app.js";

// ==========================================
// 1. CORS CONFIGURATION
// ==========================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Accept, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

// Attach CORS headers to every response
function withCors(response) {
  const headers = new Headers(response.headers);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ==========================================
// 2. CLOUDFLARE WORKER
// ==========================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // ======================================
      // 3. HANDLE CORS PREFLIGHT
      // ======================================

      // OPTIONS must be handled before Express
      // authentication or other middleware.
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      // ======================================
      // 4. WORKER HEALTH CHECK
      // ======================================

      if (url.pathname === "/health") {
        return withCors(
          Response.json({
            success: true,
            message: "SkillBridge Cloudflare Worker",
            status: "Running",
          })
        );
      }

      // ======================================
      // 5. POSTGRESQL CONNECTION TEST
      // ======================================

      if (url.pathname === "/db-test") {
        if (!env.HYPERDRIVE) {
          throw new Error("Cloudflare Hyperdrive binding is missing");
        }

        const client = new Client({
          connectionString: env.HYPERDRIVE.connectionString,
          connectionTimeoutMillis: 10000,
          query_timeout: 10000,
        });

        let connected = false;

        try {
          console.log("Attempting Supabase connection...");

          await client.connect();
          connected = true;

          console.log("Supabase connection established.");

          const result = await client.query(`
            SELECT
              current_database() AS database,
              current_user AS username,
              NOW() AS server_time
          `);

          return withCors(
            Response.json({
              success: true,
              message: "Supabase PostgreSQL connection successful",
              data: result.rows[0],
            })
          );
        } finally {
          if (connected) {
            await client.end().catch((error) => {
              console.error("Database cleanup failed:", error);
            });
          }
        }
      }

      // ======================================
      // 6. SEQUELIZE CONNECTION TEST
      // ======================================

      if (url.pathname === "/sequelize-test") {
        if (!env.HYPERDRIVE) {
          throw new Error("Cloudflare Hyperdrive binding is missing");
        }

        let sequelize;

        try {
          console.log("Testing Sequelize connection...");

          sequelize = new Sequelize(
            env.HYPERDRIVE.connectionString,
            {
              dialect: "postgres",
              dialectModule: pg,
              logging: false,
              pool: {
                max: 1,
                min: 0,
                acquire: 10000,
                idle: 10000,
              },
            }
          );

          await sequelize.authenticate();

          const [results] = await sequelize.query(`
            SELECT
              current_database() AS database,
              current_user AS username,
              NOW() AS server_time
          `);

          console.log("Sequelize connection successful.");

          return withCors(
            Response.json({
              success: true,
              message: "Sequelize connection successful",
              data: results[0],
            })
          );
        } finally {
          if (sequelize) {
            await sequelize.close().catch((error) => {
              console.error("Sequelize cleanup failed:", error);
            });
          }
        }
      }

      // ======================================
      // 7. BREVO EMAIL TEST
      // ======================================

      if (url.pathname === "/mailer-test") {
        if (!env.BREVO_API_KEY || !env.MAIL_FROM) {
          throw new Error(
            "Missing BREVO_API_KEY or MAIL_FROM secret"
          );
        }

        const response = await fetch(
          "https://api.brevo.com/v3/smtp/email",
          {
            method: "POST",
            headers: {
              "api-key": env.BREVO_API_KEY,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              sender: {
                name: "SkillBridge",
                email: env.MAIL_FROM,
              },
              to: [{ email: env.MAIL_FROM }],
              subject: "SkillBridge Cloudflare Email Test",
              textContent:
                "Your SkillBridge Cloudflare Worker successfully sent an email through Brevo.",
              htmlContent: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6">
                  <h2>SkillBridge Email Test</h2>
                  <p>Your Cloudflare Worker successfully connected to Brevo.</p>
                  <p>Transactional email delivery is being tested.</p>
                </div>
              `,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          console.error("Brevo API error:", result);

          return withCors(
            Response.json(
              {
                success: false,
                message: "Brevo email request failed",
                error: result,
              },
              { status: response.status }
            )
          );
        }

        return withCors(
          Response.json({
            success: true,
            message: "Brevo accepted the test email",
            messageId: result.messageId,
          })
        );
      }

      // ======================================
      // 8. EXPRESS API REQUEST FORWARDING
      // ======================================

      console.log(
        `${request.method} ${url.pathname} - Forwarding to Express`
      );

      const response = await handleExpressRequest(request, env);

      // Preserve the Express status, body and headers,
      // while adding CORS headers.
      return withCors(response);

    } catch (error) {
      // ======================================
      // 9. GLOBAL ERROR HANDLING
      // ======================================

      console.error("SkillBridge Worker error:", {
        message: error.message,
        stack: error.stack,
        path: url.pathname,
        method: request.method,
      });

      return withCors(
        Response.json(
          {
            success: false,
            message: "SkillBridge API request failed.",
            error: "An internal server error occurred.",
          },
          { status: 500 }
        )
      );
    }
  },
};