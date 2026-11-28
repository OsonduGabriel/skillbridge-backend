import "dotenv/config";
import sequelize from "../src/config/database.js";

async function migrateCourses() {
    const transaction = await sequelize.transaction();

    try {
        await sequelize.authenticate();

        console.log("Connected to PostgreSQL.");

        await sequelize.query(`
            ALTER TABLE "courses"
            ADD COLUMN IF NOT EXISTS "field" VARCHAR(100);
        `, { transaction });

        await sequelize.query(`
            UPDATE "courses"
            SET "field" = CASE
                WHEN LOWER("category") LIKE '%backend%'
                  OR LOWER("category") LIKE '%frontend%'
                  OR LOWER("category") LIKE '%software%'
                  OR LOWER("category") LIKE '%development%'
                THEN 'Technology & Software Development'
                ELSE 'Other'
            END
            WHERE "field" IS NULL OR TRIM("field") = '';
        `, { transaction });

        await sequelize.query(`
            ALTER TABLE "courses"
            ALTER COLUMN "field" SET NOT NULL;
        `, { transaction });

        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS "courses_field_idx"
            ON "courses" ("field");
        `, { transaction });

        await transaction.commit();

        console.log("Course field migration completed successfully.");

    } catch (error) {
        await transaction.rollback();

        console.error("Course migration failed:", error.message);
        process.exitCode = 1;

    } finally {
        await sequelize.close();
    }
}

migrateCourses();
