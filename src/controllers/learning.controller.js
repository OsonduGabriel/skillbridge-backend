import { Course, CourseModule, Lesson, Enrollment, LessonProgress, } from "../models/index.js";

const isValidUUID = (id) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};
// GET /api/v1/learning/courses
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { isPublished: true },
            attributes: [
                "id",
                "title",
                "description",
                "category",
                "difficulty",
                "providerType",
                "providerName",
                "externalUrl",
                "thumbnailUrl",
                "estimatedHours",
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } catch (error) {
        console.error("Get courses error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve courses.",
        });
    }
};

// GET /api/v1/learning/courses/:id
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID format.",
            });
        }

        const course = await Course.findOne({
            where: {
                id,
                isPublished: true,
            },
            include: [
                {
                    model: CourseModule,
                    as: "modules",
                    include: [
                        {
                            model: Lesson,
                            as: "lessons",
                            attributes: [
                                "id",
                                "title",
                                "description",
                                "contentType",
                                "durationMinutes",
                                "position",
                                "isPreview",
                            ],
                        },
                    ],
                },
            ],
            order: [
                [{ model: CourseModule, as: "modules" }, "position", "ASC"],
            ],
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: course,
        });
    } catch (error) {
        console.error("Get course details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve course details.",
        });
    }
};

// POST /api/v1/learning/enrollments
export const enrollInCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required.",
            });
        }

        const course = await Course.findOne({
            where: {
                id: courseId,
                isPublished: true,
            },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or not available.",
            });
        }

        const existingEnrollment = await Enrollment.findOne({
            where: {
                userId,
                courseId,
            },
        });

        if (existingEnrollment) {
            return res.status(409).json({
                success: false,
                message: "You are already enrolled in this course.",
            });
        }

        const enrollment = await Enrollment.create({
            userId,
            courseId,
        });

        return res.status(201).json({
            success: true,
            message: "Successfully enrolled in course.",
            data: enrollment,
        });
    } catch (error) {
        console.error("Course enrollment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to enroll in course.",
        });
    }
};

// GET /api/v1/learning/my-courses
export const getMyCourses = async (req, res) => {
    try {
        const userId = req.user.id;

        const enrollments = await Enrollment.findAll({
            where: { userId },
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: [
                        "id",
                        "title",
                        "description",
                        "category",
                        "difficulty",
                        "providerType",
                        "providerName",
                        "thumbnailUrl",
                        "estimatedHours",
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments,
        });
    } catch (error) {
        console.error("Get enrolled courses error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve enrolled courses.",
        });
    }
};

// PATCH /api/v1/learning/lessons/:id/complete
export const completeLesson = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: lessonId } = req.params;

        if (!isValidUUID(lessonId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lesson ID format.",
            });
        }

        const lesson = await Lesson.findByPk(lessonId, {
            include: [
                {
                    model: CourseModule,
                    as: "module",
                    include: [
                        {
                            model: Course,
                            as: "course",
                        },
                    ],
                },
            ],
        });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Lesson not found.",
            });
        }

        const enrollment = await Enrollment.findOne({
            where: {
                userId,
                courseId: lesson.module.courseId,
                status: ["active", "completed"],
            },
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You must be enrolled in this course to complete its lessons.",
            });
        }

        const [lessonProgress] = await LessonProgress.findOrCreate({
            where: {
                enrollmentId: enrollment.id,
                lessonId,
            },
            defaults: {
                isCompleted: true,
                completedAt: new Date(),
            },
        });

        if (!lessonProgress.isCompleted) {
            await lessonProgress.update({
                isCompleted: true,
                completedAt: new Date(),
            });
        }

        const modules = await CourseModule.findAll({
            where: { courseId: enrollment.courseId },
            attributes: ["id"],
        });

        const moduleIds = modules.map((module) => module.id);

        const totalLessons = await Lesson.count({
            where: { moduleId: moduleIds },
        });

        const completedLessons = await LessonProgress.count({
            where: {
                enrollmentId: enrollment.id,
                isCompleted: true,
            },
        });

        const progressPercentage =
            totalLessons === 0
                ? 0
                : Math.round((completedLessons / totalLessons) * 100);

        await enrollment.update({
            progressPercentage,
            status: progressPercentage === 100 ? "completed" : "active",
            completedAt: progressPercentage === 100 ? new Date() : null,
        });

        return res.status(200).json({
            success: true,
            message: "Lesson completed successfully.",
            data: {
                lessonId,
                progressPercentage,
                completedLessons,
                totalLessons,
            },
        });
    } catch (error) {
        console.error("Complete lesson error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to complete lesson.",
        });
    }
};

// GET /api/v1/learning/progress
export const getLearningProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        const enrollments = await Enrollment.findAll({
            where: { userId },
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: [
                        "id",
                        "title",
                        "category",
                        "difficulty",
                        "estimatedHours",
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const totalCourses = enrollments.length;

        const completedCourses = enrollments.filter(
            (enrollment) => enrollment.status === "completed"
        ).length;

        const overallProgress =
            totalCourses === 0
                ? 0
                : Math.round(
                    enrollments.reduce(
                        (total, enrollment) =>
                            total + enrollment.progressPercentage,
                        0
                    ) / totalCourses
                );

        return res.status(200).json({
            success: true,
            data: {
                totalCourses,
                completedCourses,
                activeCourses: totalCourses - completedCourses,
                overallProgress,
                courses: enrollments,
            },
        });
    } catch (error) {
        console.error("Get learning progress error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve learning progress.",
        });
    }
};