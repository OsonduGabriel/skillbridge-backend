
import { Client } from "pg";
import { Sequelize } from "sequelize";
import pg from "pg";
import { handleExpressRequest } from "./app.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Worker health check
    if (url.pathname === "/health") {
      return Response.json({
        success: true,
        message: "SkillBridge Cloudflare Worker",
        status: "Running",
      });
    }

    // 2. PostgreSQL connection test using pg
    if (url.pathname === "/db-test") {
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

        const result = await client.query(
          `SELECT
            current_database() AS database,
            current_user AS username,
            NOW() AS server_time`
        );

        return Response.json({
          success: true,
          message: "Supabase PostgreSQL connection successful",
          data: result.rows[0],
        });
      } catch (error) {
        console.error("Database connection test failed:", error);

        return Response.json(
          {
            success: false,
            message: "Database connection failed.",
            error: error.message,
          },
          { status: 500 }
        );
      } finally {
        if (connected) {
          await client.end().catch((error) => {
            console.error("Database cleanup failed:", error);
          });
        }
      }
    }

    // 3. Sequelize compatibility test
    if (url.pathname === "/sequelize-test") {
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

        const [results] = await sequelize.query(
          `SELECT
            current_database() AS database,
            current_user AS username,
            NOW() AS server_time`
        );

        console.log("Sequelize connection successful.");

        return Response.json({
          success: true,
          message: "Sequelize connection successful",
          data: results[0],
        });
      } catch (error) {
        console.error("Sequelize test failed:", error);

        return Response.json(
          {
            success: false,
            message: "Sequelize connection failed",
            error: error.message,
          },
          { status: 500 }
        );
      } finally {
        if (sequelize) {
          await sequelize.close().catch((error) => {
            console.error("Sequelize cleanup failed:", error);
          });
        }
      }
    }


    // Brevo HTTPS email delivery test
    if (url.pathname === "/mailer-test") {
      try {
        if (!env.BREVO_API_KEY || !env.MAIL_FROM) {
          throw new Error("Missing BREVO_API_KEY or MAIL_FROM secret");
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

          return Response.json(
            {
              success: false,
              message: "Brevo email request failed",
              error: result,
            },
            { status: response.status }
          );
        }

        return Response.json({
          success: true,
          message: "Brevo accepted the test email",
          messageId: result.messageId,
        });
      } catch (error) {
        console.error("Brevo email test failed:", error);

        return Response.json(
          {
            success: false,
            message: "Brevo email test failed",
            error: error.message,
          },
          { status: 500 }
        );
      }
    }

    // 4. Forward other requests to the existing Express API.
    try {
      return await handleExpressRequest(request, env);
    } catch (error) {
      console.error("SkillBridge API request failed:");
      console.error(error.stack || error);

      return Response.json(
        {
          success: false,
          message: "SkillBridge API request failed.",
          error: error.message,
        },
        { status: 500 }
      );
    }
  },
};
