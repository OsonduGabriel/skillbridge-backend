
const learningSchema = {
    EnrollCourseRequest: {
        type: "object",
        required: ["courseId"],
        properties: {
            courseId: {
                type: "string",
                format: "uuid",
                example: "550e8400-e29b-41d4-a716-446655440000",
            },
        },
        additionalProperties: false,
    },

    LearningCourse: {
        type: "object",
        properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", example: "Backend Development with Node.js" },
            description: { type: "string" },
            category: { type: "string", example: "Backend Development" },
            difficulty: {
                type: "string",
                enum: ["beginner", "intermediate", "advanced"],
            },
            providerType: {
                type: "string",
                enum: ["internal", "external"],
            },
            providerName: { type: "string", nullable: true },
            externalUrl: { type: "string", nullable: true },
            thumbnailUrl: { type: "string", nullable: true },
            estimatedHours: { type: "number", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    LearningLesson: {
        type: "object",
        properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            contentType: {
                type: "string",
                enum: ["video", "article", "quiz", "practical"],
            },
            content: { type: "string", nullable: true },
            resourceUrl: { type: "string", nullable: true },
            durationMinutes: { type: "integer", nullable: true },
            position: { type: "integer" },
            isPreview: { type: "boolean" },
        },
    },

    LearningModule: {
        type: "object",
        properties: {
            id: { type: "string", format: "uuid" },
            courseId: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            position: { type: "integer" },
            lessons: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/LearningLesson",
                },
            },
        },
    },

    LearningCourseDetail: {
        allOf: [
            { $ref: "#/components/schemas/LearningCourse" },
            {
                type: "object",
                properties: {
                    modules: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/LearningModule",
                        },
                    },
                },
            },
        ],
    },

    LearningEnrollment: {
        type: "object",
        properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            courseId: { type: "string", format: "uuid" },
            status: {
                type: "string",
                enum: ["active", "completed", "cancelled"],
            },
            progressPercentage: {
                type: "integer",
                minimum: 0,
                maximum: 100,
            },
            enrolledAt: { type: "string", format: "date-time" },
            completedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
            },
        },
    },

    LessonCompletionResponse: {
        type: "object",
        properties: {
            lessonId: { type: "string", format: "uuid" },
            progressPercentage: { type: "integer" },
            completedLessons: { type: "integer" },
            totalLessons: { type: "integer" },
        },
    },

    LearningApiResponse: {
        type: "object",
        properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            count: { type: "integer" },
            data: {
                description: "Response data. Its structure depends on the endpoint.",
            },
        },
    },
};

export default learningSchema;
