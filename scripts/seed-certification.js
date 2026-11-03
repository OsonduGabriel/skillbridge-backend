
import sequelize from "../src/config/database.js";
import { Course, Certification } from "../src/models/index.js";

const courseId = "67aeac7f-0c36-43e3-a714-b9048c3025f5";

async function seedCertification() {
    try {
        await sequelize.authenticate();

        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new Error("Course not found.");
        }

        let certification = await Certification.findOne({
            where: { courseId },
        });

        if (!certification) {
            certification = await Certification.create({
                courseId,
                title: "Backend Development with Node.js Certificate",
                description:
                    "Certificate awarded to learners who successfully complete the Backend Development with Node.js course.",
                completionRequired: 100,
                isActive: true,
            });
        }

        console.log("Certification created or already exists.");
        console.log("Certification ID:", certification.id);
        console.log("Title:", certification.title);
    } catch (error) {
        console.error("Certification seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

seedCertification();
