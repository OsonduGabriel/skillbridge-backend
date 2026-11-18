import sequelize from "../src/config/database.js";
import Skill from "../src/models/skill.model.js";
import Recommendation from "../src/models/recommendation.model.js";

const skills = [
    {
        name: "JavaScript",
        description: "Core JavaScript programming for backend development.",
        category: "technical",
        recommendations: [
            {
                title: "MDN JavaScript Guide",
                description: "Learn JavaScript fundamentals, functions, objects, arrays, promises, and modern language features.",
                type: "learning_resource",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
                difficulty: "beginner",
                estimatedHours: 10,
            },
            {
                title: "JavaScript Expense Tracker",
                description: "Build an expense tracker using JavaScript, with functions for adding, editing, deleting, and calculating expenses.",
                type: "project",
                difficulty: "beginner",
                estimatedHours: 8,
            },
            {
                title: "Asynchronous JavaScript",
                description: "Study promises, async/await, error handling, and asynchronous programming.",
                type: "learning_resource",
                url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS",
                difficulty: "intermediate",
                estimatedHours: 6,
            },
        ],
    },
    {
        name: "Node.js",
        description: "Server-side JavaScript development using Node.js.",
        category: "technical",
        recommendations: [
            {
                title: "Introduction to Node.js",
                description: "Learn the Node.js runtime, modules, npm, asynchronous operations, and server-side JavaScript.",
                type: "learning_resource",
                url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
                difficulty: "beginner",
                estimatedHours: 8,
            },
            {
                title: "Build a Node.js CLI Application",
                description: "Create a command-line task manager with file storage, input validation, and error handling.",
                type: "project",
                difficulty: "intermediate",
                estimatedHours: 10,
            },
            {
                title: "Node.js HTTP Server",
                description: "Study HTTP servers, streams, events, and the built-in Node.js modules.",
                type: "learning_resource",
                url: "https://nodejs.org/api/http.html",
                difficulty: "intermediate",
                estimatedHours: 6,
            },
        ],
    },
    {
        name: "Express.js",
        description: "Building web applications and REST APIs with Express.js.",
        category: "technical",
        recommendations: [
            {
                title: "Express.js Official Guide",
                description: "Learn Express installation, routing, middleware, request handling, and error handling.",
                type: "learning_resource",
                url: "https://expressjs.com/en/guide/routing.html",
                difficulty: "beginner",
                estimatedHours: 8,
            },
            {
                title: "Build an Authentication API",
                description: "Build an Express API with registration, login, password hashing, JWT authentication, and protected routes.",
                type: "project",
                difficulty: "intermediate",
                estimatedHours: 15,
            },
            {
                title: "Express Middleware Guide",
                description: "Understand application middleware, router middleware, error-handling middleware, and custom middleware.",
                type: "learning_resource",
                url: "https://expressjs.com/en/guide/using-middleware.html",
                difficulty: "intermediate",
                estimatedHours: 5,
            },
        ],
    },
    {
        name: "PostgreSQL",
        description: "Relational database design, SQL queries, and PostgreSQL administration.",
        category: "technical",
        recommendations: [
            {
                title: "PostgreSQL Official Tutorial",
                description: "Learn relational database concepts, SQL queries, joins, aggregates, and foreign keys.",
                type: "learning_resource",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                difficulty: "beginner",
                estimatedHours: 10,
            },
            {
                title: "Build a Relational Database Project",
                description: "Design a PostgreSQL database for a learning platform with users, courses, enrollments, and progress tracking.",
                type: "project",
                difficulty: "intermediate",
                estimatedHours: 12,
            },
            {
                title: "SQLBolt Interactive Lessons",
                description: "Practice SQL queries, filtering, sorting, joins, and database operations.",
                type: "learning_resource",
                url: "https://sqlbolt.com/",
                difficulty: "beginner",
                estimatedHours: 5,
            },
        ],
    },
    {
        name: "REST API Design",
        description: "Designing consistent, secure, and maintainable RESTful APIs.",
        category: "technical",
        recommendations: [
            {
                title: "MDN HTTP Overview",
                description: "Understand HTTP requests, responses, methods, status codes, headers, and communication between clients and servers.",
                type: "learning_resource",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
                difficulty: "beginner",
                estimatedHours: 5,
            },
            {
                title: "Design a Versioned REST API",
                description: "Create a versioned REST API with resource-based routes, pagination, filtering, validation, and consistent error responses.",
                type: "project",
                difficulty: "advanced",
                estimatedHours: 12,
            },
            {
                title: "REST API Tutorial",
                description: "Study REST principles, resource naming, HTTP methods, status codes, and API design conventions.",
                type: "learning_resource",
                url: "https://restfulapi.net/",
                difficulty: "intermediate",
                estimatedHours: 6,
            },
        ],
    },
];

async function seedRecommendations() {
    try {
        await sequelize.authenticate();
        console.log("Connected to Supabase PostgreSQL.");

        let skillsCreated = 0;
        let recommendationsCreated = 0;

        await sequelize.transaction(async (transaction) => {
            for (const skillData of skills) {
                const [skill, skillCreated] = await Skill.findOrCreate({
                    where: { name: skillData.name },
                    defaults: {
                        name: skillData.name,
                        description: skillData.description,
                        category: skillData.category,
                    },
                    transaction,
                });

                if (skillCreated) skillsCreated++;

                for (const item of skillData.recommendations) {
                    const [, recommendationCreated] =
                        await Recommendation.findOrCreate({
                            where: {
                                title: item.title,
                                skillId: skill.id,
                                type: item.type,
                            },
                            defaults: {
                                ...item,
                                skillId: skill.id,
                                isActive: true,
                            },
                            transaction,
                        });

                    if (recommendationCreated) recommendationsCreated++;
                }
            }
        });

        console.log("Seeding completed successfully.");
        console.log("New skills:", skillsCreated);
        console.log("New recommendations:", recommendationsCreated);
        console.log("Expected catalogue: 5 skills and 15 recommendations.");
    } catch (error) {
        console.error("Recommendation seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

seedRecommendations();

