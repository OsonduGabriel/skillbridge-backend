
import "dotenv/config";

import sequelize from "../src/config/database.js";

// Register existing and new model associations.
import "../src/models/index.js";
import "../src/models/associations.model.js";

import { Course, CourseModule, Lesson, Enrollment, LessonProgress, Certification, UserCertification, } from "../src/models/index.js";

async function createLearningTables() {
    try {
        await sequelize.authenticate();

        console.log("Connected to Supabase PostgreSQL.");

        const models = [
            ["courses", Course],
            ["course_modules", CourseModule],
            ["lessons", Lesson],
            ["course_enrollments", Enrollment],
            ["lesson_progress", LessonProgress],
            ["certifications", Certification],
            ["user_certifications", UserCertification],
        ];

        for (const [tableName, model] of models) {
            await model.sync();
            console.log(`Verified/created table: ${tableName}`);
        }

        console.log("Learning and Certification tables are ready.");
    } catch (error) {
        console.error("Learning table creation failed:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

createLearningTables();
