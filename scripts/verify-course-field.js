import "dotenv/config";
import sequelize from "../src/config/database.js";

try {
    await sequelize.authenticate();

    const [courses] = await sequelize.query(`
        SELECT id, title, field, category, "providerType", "isPublished"
        FROM courses
        ORDER BY title;
    `);

    console.table(courses);

} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    await sequelize.close();
}
