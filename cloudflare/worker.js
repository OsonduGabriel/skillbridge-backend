import { Client } from "pg";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({
        success: true,
        message: "SkillBridge Cloudflare Worker",
        status: "Running",
      });
    }

    if (url.pathname === "/db-test") {
      const client = new Client({
        connectionString: env.HYPERDRIVE.connectionString,
      });

      try {
        await client.connect();

        const result = await client.query(
          "SELECT current_database() AS database, current_user AS username, NOW() AS server_time"
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
            message: "Database connection failed. Check Worker logs.",
          },
          { status: 500 }
        );
      } finally {
        await client.end().catch((error) => {
          console.error("Database client cleanup failed:", error);
        });
      }
    }

    return Response.json(
      {
        success: false,
        message: "Route not found.",
      },
      { status: 404 }
    );
  },
};