import "dotenv/config";
import sequelize from "../src/config/database.js";

async function inspectCourses() {
    try {
        await sequelize.authenticate();
        console.log("\nCONNECTED TO DATABASE");

        const [columns] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'courses'
            ORDER BY ordinal_position
        `);

        console.log("\nCOURSES TABLE COLUMNS:");
        console.table(columns);

        const [courses] = await sequelize.query(`
            SELECT id, title, category, "providerType", "isPublished"
            FROM courses
            ORDER BY "createdAt" DESC
        `);

        console.log("\nEXISTING COURSES:");
        console.table(courses);

    } catch (error) {
        console.error("Inspection failed:", error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

inspectCourses();
