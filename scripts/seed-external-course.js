import sequelize from "../src/config/database.js";
import { Course } from "../src/models/index.js";

async function seedExternalCourse() {
    try {
        await sequelize.authenticate();

        const existingCourse = await Course.findOne({
            where: {
                title: "Node.js Online Learning - Coursera",
                providerType: "external",
                providerName: "Coursera",
            },
        });

        if (existingCourse) {
            console.log("External course already exists.");
            console.log("Course ID:", existingCourse.id);
            return;
        }

        const course = await Course.create({
            title: "Node.js Online Learning - Coursera",
            description: "Explore Node.js learning opportunities through Coursera.",
            category: "Backend Development",
            difficulty: "beginner",
            providerType: "external",
            providerName: "Coursera",
            externalUrl: "https://www.coursera.org/courses?query=node.js",
            estimatedHours: 15,
            isPublished: true,
        });

        console.log("External course created successfully.");
        console.log("Course ID:", course.id);
    } catch (error) {
        console.error("External course seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

seedExternalCourse();