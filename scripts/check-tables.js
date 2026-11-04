import "dotenv/config";
import sequelize from "../src/config/database.js";

async function inspectUsersTable() {
    try {
        await sequelize.authenticate();

        const [columns] = await sequelize.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
      ORDER BY ordinal_position;
    `);

        console.table(columns);
    } catch (error) {
        console.error("Inspection failed:", error.message);
    } finally {
        await sequelize.close();
    }
}

inspectUsersTable();