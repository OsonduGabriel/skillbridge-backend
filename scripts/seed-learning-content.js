import sequelize from "../src/config/database.js";
import { Course, CourseModule, Lesson } from "../src/models/index.js";

const courseId = "67aeac7f-0c36-43e3-a714-b9048c3025f5";

async function seedLearningContent() {
    try {
        await sequelize.authenticate();

        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new Error("Course not found.");
        }

        let module = await CourseModule.findOne({
            where: { courseId, position: 1 },
        });

        if (!module) {
            module = await CourseModule.create({
                courseId,
                title: "Introduction to Backend Development",
                description: "Learn the fundamentals of backend development with Node.js.",
                position: 1,
            });
        }

        let lesson = await Lesson.findOne({
            where: { moduleId: module.id, position: 1 },
        });

        if (!lesson) {
            lesson = await Lesson.create({
                moduleId: module.id,
                title: "Understanding Backend Development",
                description: "An introduction to servers, APIs, and backend architecture.",
                contentType: "article",
                content: "Backend development involves building the server-side logic of applications. It handles requests, processes data, communicates with databases, and returns responses to clients.",
                durationMinutes: 10,
                position: 1,
                isPreview: true,
            });
        }

        console.log("Learning content created or already exists.");
        console.log("Module ID:", module.id);
        console.log("Lesson ID:", lesson.id);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

seedLearningContent();
