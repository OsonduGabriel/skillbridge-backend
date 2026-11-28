
import sequelize from "../src/config/database.js";
import { Course, CourseModule, Lesson } from "../src/models/index.js";

const learningCatalogue = [
    {
        field: "Technology & Software Development",
        category: "Software Development",
        title: "Foundations of Software Development",
        description: "Learn programming fundamentals, software design, APIs, databases, and application development.",
        modules: [
            {
                title: "Programming Fundamentals",
                lessons: [
                    ["Introduction to Programming", "Understand programming concepts, algorithms, variables, data types, and control flow.", "article"],
                    ["Practical Programming Exercises", "Practise writing functions, using conditions, loops, and solving simple problems.", "practical"],
                ],
            },
            {
                title: "Backend Development",
                lessons: [
                    ["Understanding Servers and APIs", "Learn how servers receive requests, process information, and return responses.", "article"],
                    ["Building REST APIs", "Explore HTTP methods, routes, controllers, request validation, and JSON responses.", "practical"],
                ],
            },
            {
                title: "Databases and Application Security",
                lessons: [
                    ["Database Fundamentals", "Understand relational databases, tables, relationships, and SQL queries.", "article"],
                    ["Introduction to Application Security", "Learn authentication, authorization, password hashing, and input validation.", "article"],
                ],
            },
        ],
    },
    {
        field: "Data & Artificial Intelligence",
        category: "Data Science and AI",
        title: "Foundations of Data Science and Artificial Intelligence",
        description: "Learn data analysis, statistics, data visualization, and introductory machine learning.",
        modules: [
            {
                title: "Data Fundamentals",
                lessons: [
                    ["Understanding Data", "Explore data types, datasets, data quality, and the data analysis process.", "article"],
                    ["Working with Spreadsheets", "Practise organizing, cleaning, filtering, and summarizing datasets.", "practical"],
                ],
            },
            {
                title: "Data Analysis",
                lessons: [
                    ["Introduction to Statistics", "Understand averages, distributions, probability, and basic statistical reasoning.", "article"],
                    ["Data Visualization", "Learn how charts and dashboards communicate patterns and trends.", "practical"],
                ],
            },
            {
                title: "Artificial Intelligence",
                lessons: [
                    ["Introduction to AI and Machine Learning", "Understand AI, machine learning, model training, and common use cases.", "article"],
                    ["Responsible AI", "Explore bias, privacy, transparency, and responsible use of AI systems.", "article"],
                ],
            },
        ],
    },
    {
        field: "Cybersecurity & Networking",
        category: "Cybersecurity",
        title: "Cybersecurity and Networking Fundamentals",
        description: "Understand computer networks, security principles, threats, and defensive practices.",
        modules: [
            {
                title: "Networking Fundamentals",
                lessons: [
                    ["How Computer Networks Work", "Learn about IP addresses, routers, switches, and network communication.", "article"],
                    ["Understanding Network Protocols", "Explore DNS, HTTP, HTTPS, TCP, and basic network troubleshooting.", "article"],
                ],
            },
            {
                title: "Cybersecurity Principles",
                lessons: [
                    ["Introduction to Cybersecurity", "Understand confidentiality, integrity, availability, and common security threats.", "article"],
                    ["Threats and Vulnerabilities", "Learn about phishing, malware, weak passwords, and common vulnerabilities.", "article"],
                ],
            },
            {
                title: "Security Practices",
                lessons: [
                    ["Identity and Access Management", "Explore authentication, authorization, multi-factor authentication, and access control.", "article"],
                    ["Security Awareness and Incident Response", "Learn basic incident reporting, response procedures, and security hygiene.", "article"],
                ],
            },
        ],
    },
    {
        field: "Design & Creative Arts",
        category: "UI/UX and Graphic Design",
        title: "Introduction to Digital Design and Creativity",
        description: "Learn design principles, visual communication, user experience, and digital design workflows.",
        modules: [
            {
                title: "Design Fundamentals",
                lessons: [
                    ["Principles of Visual Design", "Explore colour, typography, contrast, alignment, and visual hierarchy.", "article"],
                    ["Understanding Layout and Composition", "Practise arranging visual elements to create clear and balanced designs.", "practical"],
                ],
            },
            {
                title: "User Experience Design",
                lessons: [
                    ["Introduction to UX Design", "Understand user needs, personas, user journeys, and usability.", "article"],
                    ["Wireframing and Prototyping", "Learn how to plan interfaces using wireframes and interactive prototypes.", "practical"],
                ],
            },
            {
                title: "Digital Design Projects",
                lessons: [
                    ["Introduction to Design Tools", "Explore digital design tools and common design workflows.", "article"],
                    ["Building a Design Portfolio", "Learn how to document design decisions and present completed projects.", "practical"],
                ],
            },
        ],
    },
    {
        field: "Business & Management",
        category: "Business Management",
        title: "Business Management Fundamentals",
        description: "Learn business planning, operations, leadership, teamwork, and project management.",
        modules: [
            {
                title: "Understanding Business",
                lessons: [
                    ["Introduction to Business Models", "Explore how businesses create value, serve customers, and generate revenue.", "article"],
                    ["Business Planning", "Learn the purpose and key components of a practical business plan.", "article"],
                ],
            },
            {
                title: "Management and Leadership",
                lessons: [
                    ["Principles of Management", "Understand planning, organizing, leading, and controlling business activities.", "article"],
                    ["Teamwork and Communication", "Explore collaboration, delegation, conflict resolution, and workplace communication.", "article"],
                ],
            },
            {
                title: "Project and Operations Management",
                lessons: [
                    ["Introduction to Project Management", "Learn project scope, deliverables, timelines, risks, and stakeholders.", "article"],
                    ["Managing Business Operations", "Understand processes, resources, quality, and operational improvement.", "article"],
                ],
            },
        ],
    },
    {
        field: "Marketing & Communications",
        category: "Digital Marketing",
        title: "Digital Marketing and Communications Fundamentals",
        description: "Learn digital marketing, content strategy, social media, SEO, and campaign measurement.",
        modules: [
            {
                title: "Marketing Fundamentals",
                lessons: [
                    ["Understanding Marketing", "Explore target audiences, customer needs, positioning, and marketing channels.", "article"],
                    ["Developing a Marketing Strategy", "Learn how to define objectives, audiences, and marketing plans.", "practical"],
                ],
            },
            {
                title: "Digital Marketing Channels",
                lessons: [
                    ["Content and Social Media Marketing", "Understand content planning, social media platforms, and audience engagement.", "article"],
                    ["Search Engine Optimization", "Learn keywords, search intent, on-page SEO, and content discoverability.", "article"],
                ],
            },
            {
                title: "Campaign Measurement",
                lessons: [
                    ["Introduction to Marketing Analytics", "Understand reach, impressions, engagement, conversions, and campaign metrics.", "article"],
                    ["Evaluating Marketing Campaigns", "Practise reviewing campaign results and identifying improvements.", "practical"],
                ],
            },
        ],
    },
    {
        field: "Engineering & Manufacturing",
        category: "Engineering Fundamentals",
        title: "Engineering and Manufacturing Fundamentals",
        description: "Explore engineering principles, technical drawings, manufacturing processes, and quality control.",
        modules: [
            {
                title: "Engineering Principles",
                lessons: [
                    ["Introduction to Engineering", "Understand engineering disciplines, problem-solving, and the engineering design process.", "article"],
                    ["Engineering Mathematics and Measurement", "Explore units, measurements, estimation, and basic technical calculations.", "practical"],
                ],
            },
            {
                title: "Design and Manufacturing",
                lessons: [
                    ["Technical Drawing Fundamentals", "Learn drawing conventions, dimensions, projections, and technical documentation.", "article"],
                    ["Introduction to Manufacturing Processes", "Explore machining, fabrication, assembly, and production methods.", "article"],
                ],
            },
            {
                title: "Quality and Safety",
                lessons: [
                    ["Quality Control Fundamentals", "Understand inspection, standards, defects, and continuous improvement.", "article"],
                    ["Engineering Safety Practices", "Learn hazard identification, risk assessment, and workplace safety principles.", "article"],
                ],
            },
        ],
    },
    {
        field: "Healthcare & Life Sciences",
        category: "Healthcare Fundamentals",
        title: "Healthcare and Life Sciences Fundamentals",
        description: "Explore healthcare systems, health information, research literacy, and public health principles.",
        modules: [
            {
                title: "Healthcare Fundamentals",
                lessons: [
                    ["Introduction to Healthcare Systems", "Understand healthcare services, care settings, and the roles of health professionals.", "article"],
                    ["Health Communication", "Explore clear, respectful, and responsible communication in healthcare settings.", "article"],
                ],
            },
            {
                title: "Public Health",
                lessons: [
                    ["Introduction to Public Health", "Learn about population health, prevention, and health promotion.", "article"],
                    ["Understanding Disease Prevention", "Explore hygiene, prevention strategies, and public health education.", "article"],
                ],
            },
            {
                title: "Health Information and Research",
                lessons: [
                    ["Introduction to Health Information", "Understand health records, data quality, confidentiality, and privacy.", "article"],
                    ["Reading Health Research", "Learn how to identify research questions, evidence, and limitations in health studies.", "article"],
                ],
            },
        ],
    },
    {
        field: "Finance & Accounting",
        category: "Finance and Accounting",
        title: "Finance and Accounting Fundamentals",
        description: "Learn financial literacy, bookkeeping, accounting principles, budgeting, and financial analysis.",
        modules: [
            {
                title: "Financial Literacy",
                lessons: [
                    ["Understanding Money and Finance", "Explore income, expenses, savings, assets, liabilities, and financial goals.", "article"],
                    ["Personal and Business Budgeting", "Practise preparing budgets and monitoring spending.", "practical"],
                ],
            },
            {
                title: "Accounting Fundamentals",
                lessons: [
                    ["Introduction to Bookkeeping", "Understand transactions, journals, ledgers, and basic bookkeeping.", "article"],
                    ["Understanding Financial Statements", "Explore income statements, balance sheets, and cash flow statements.", "article"],
                ],
            },
            {
                title: "Financial Analysis",
                lessons: [
                    ["Introduction to Financial Ratios", "Learn how basic financial ratios help evaluate business performance.", "article"],
                    ["Financial Reporting and Ethics", "Understand accurate reporting, professional conduct, and financial accountability.", "article"],
                ],
            },
        ],
    },
    {
        field: "Education & Training",
        category: "Education and Instructional Design",
        title: "Education and Training Fundamentals",
        description: "Learn teaching principles, lesson planning, assessment, and digital learning.",
        modules: [
            {
                title: "Foundations of Teaching",
                lessons: [
                    ["Introduction to Learning and Teaching", "Explore learning theories, learner needs, and effective teaching practices.", "article"],
                    ["Understanding Different Learners", "Learn how learners differ and why inclusive teaching matters.", "article"],
                ],
            },
            {
                title: "Instructional Planning",
                lessons: [
                    ["Lesson Planning Fundamentals", "Understand learning objectives, lesson structure, and teaching resources.", "practical"],
                    ["Assessment and Feedback", "Explore formative assessment, summative assessment, and constructive feedback.", "article"],
                ],
            },
            {
                title: "Digital Education",
                lessons: [
                    ["Introduction to E-Learning", "Understand online learning environments and digital learning resources.", "article"],
                    ["Creating Learning Materials", "Practise structuring educational content for online and classroom delivery.", "practical"],
                ],
            },
        ],
    },
    {
        field: "Agriculture & Environmental Science",
        category: "Agriculture and Environmental Science",
        title: "Agriculture and Environmental Science Fundamentals",
        description: "Learn sustainable agriculture, soil and water management, and environmental protection.",
        modules: [
            {
                title: "Agricultural Fundamentals",
                lessons: [
                    ["Introduction to Agriculture", "Explore crop production, livestock systems, and agricultural value chains.", "article"],
                    ["Understanding Soil and Plant Health", "Learn basic soil properties, plant nutrients, and crop health concepts.", "article"],
                ],
            },
            {
                title: "Sustainable Agriculture",
                lessons: [
                    ["Sustainable Farming Practices", "Explore responsible land use, crop rotation, and resource conservation.", "article"],
                    ["Water Management in Agriculture", "Understand irrigation, water conservation, and efficient water use.", "article"],
                ],
            },
            {
                title: "Environmental Science",
                lessons: [
                    ["Introduction to Environmental Science", "Learn about ecosystems, biodiversity, pollution, and environmental change.", "article"],
                    ["Environmental Protection", "Explore waste management, conservation, and sustainable development.", "article"],
                ],
            },
        ],
    },
    {
        field: "Law & Professional Services",
        category: "Law and Professional Practice",
        title: "Law and Professional Services Fundamentals",
        description: "Explore legal systems, legal research, professional ethics, and workplace practice.",
        modules: [
            {
                title: "Introduction to Law",
                lessons: [
                    ["Understanding Legal Systems", "Explore the purpose of law, legal institutions, and sources of law.", "article"],
                    ["Introduction to Legal Research", "Learn how to identify legal questions and locate relevant legal materials.", "article"],
                ],
            },
            {
                title: "Professional Ethics",
                lessons: [
                    ["Ethics in Professional Practice", "Understand integrity, confidentiality, accountability, and professional conduct.", "article"],
                    ["Communication and Client Relations", "Explore professional communication, listening, and responsible client service.", "article"],
                ],
            },
            {
                title: "Professional Skills",
                lessons: [
                    ["Document and Case Management", "Learn basic principles of organizing, reviewing, and maintaining professional documents.", "article"],
                    ["Critical Thinking and Problem Solving", "Practise identifying issues, evaluating information, and structuring solutions.", "practical"],
                ],
            },
        ],
    },
];

const externalOpportunities = [
    {
        field: "Technology & Software Development",
        title: "Software Development Learning - freeCodeCamp",
        category: "Software Development",
        providerName: "freeCodeCamp",
        externalUrl: "https://www.freecodecamp.org/learn/",
        description: "Explore free programming and software development learning paths, tutorials, and practical coding exercises.",
        difficulty: "beginner",
        estimatedHours: 40,
    },
    {
        field: "Data & Artificial Intelligence",
        title: "Data and Machine Learning Courses - Kaggle Learn",
        category: "Data Science and AI",
        providerName: "Kaggle",
        externalUrl: "https://www.kaggle.com/learn",
        description: "Explore practical learning resources covering data analysis, Python, machine learning, and related topics.",
        difficulty: "beginner",
        estimatedHours: 20,
    },
    {
        field: "Cybersecurity & Networking",
        title: "Networking and Cybersecurity Learning - Cisco",
        category: "Cybersecurity",
        providerName: "Cisco Networking Academy",
        externalUrl: "https://www.netacad.com/",
        description: "Explore networking, cybersecurity, and digital skills learning resources from Cisco Networking Academy.",
        difficulty: "beginner",
        estimatedHours: 30,
    },
    {
        field: "Design & Creative Arts",
        title: "Design Learning Resources - Figma",
        category: "UI/UX and Graphic Design",
        providerName: "Figma",
        externalUrl: "https://www.figma.com/resource-library/",
        description: "Explore design resources covering interface design, collaboration, prototyping, and design workflows.",
        difficulty: "beginner",
        estimatedHours: 10,
    },
    {
        field: "Business & Management",
        title: "Project Management Learning - PMI",
        category: "Business Management",
        providerName: "Project Management Institute",
        externalUrl: "https://www.pmi.org/learning",
        description: "Explore project management learning resources and professional development materials.",
        difficulty: "beginner",
        estimatedHours: 15,
    },
    {
        field: "Marketing & Communications",
        title: "Digital Marketing Courses - HubSpot Academy",
        category: "Digital Marketing",
        providerName: "HubSpot Academy",
        externalUrl: "https://academy.hubspot.com/",
        description: "Explore learning resources in digital marketing, content marketing, social media, and sales.",
        difficulty: "beginner",
        estimatedHours: 15,
    },
    {
        field: "Engineering & Manufacturing",
        title: "Engineering and Design Learning - Autodesk",
        category: "Engineering Fundamentals",
        providerName: "Autodesk",
        externalUrl: "https://www.autodesk.com/learn",
        description: "Explore learning resources for engineering design, CAD tools, and digital manufacturing workflows.",
        difficulty: "beginner",
        estimatedHours: 20,
    },
    {
        field: "Healthcare & Life Sciences",
        title: "Global Health Learning - WHO Academy",
        category: "Healthcare Fundamentals",
        providerName: "WHO Academy",
        externalUrl: "https://www.whoacademy.org/",
        description: "Explore health-related learning and professional development resources from the World Health Organization.",
        difficulty: "beginner",
        estimatedHours: 10,
    },
    {
        field: "Finance & Accounting",
        title: "Money and Business Learning - OpenLearn",
        category: "Finance and Accounting",
        providerName: "OpenLearn",
        externalUrl: "https://www.open.edu/openlearn/money-business",
        description: "Explore free learning materials covering money, business, finance, and related subjects.",
        difficulty: "beginner",
        estimatedHours: 15,
    },
    {
        field: "Education & Training",
        title: "Open Educational Resources - UNESCO",
        category: "Education and Instructional Design",
        providerName: "UNESCO",
        externalUrl: "https://www.unesco.org/en/open-educational-resources",
        description: "Explore open educational resources and materials supporting teaching and learning.",
        difficulty: "beginner",
        estimatedHours: 10,
    },
    {
        field: "Agriculture & Environmental Science",
        title: "Agriculture Learning Resources - FAO",
        category: "Agriculture and Environmental Science",
        providerName: "FAO eLearning Academy",
        externalUrl: "https://elearning.fao.org/",
        description: "Explore learning resources covering agriculture, food security, nutrition, and sustainable development.",
        difficulty: "beginner",
        estimatedHours: 15,
    },
    {
        field: "Law & Professional Services",
        title: "Law and Society Learning - OpenLearn",
        category: "Law and Professional Practice",
        providerName: "OpenLearn",
        externalUrl: "https://www.open.edu/openlearn/society-politics-law",
        description: "Explore open learning materials covering law, society, politics, and professional topics.",
        difficulty: "beginner",
        estimatedHours: 15,
    },
];

async function seedInternalCourse(courseData) {
    const [course] = await Course.findOrCreate({
        where: {
            title: courseData.title,
            providerType: "internal",
            providerName: "SkillBridge",
        },
        defaults: {
            title: courseData.title,
            description: courseData.description,
            field: courseData.field,
            category: courseData.category,
            difficulty: "beginner",
            providerType: "internal",
            providerName: "SkillBridge",
            estimatedHours: 12,
            isPublished: true,
        },
    });

    for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
        const moduleData = courseData.modules[moduleIndex];
        const position = moduleIndex + 1;

        const [module] = await CourseModule.findOrCreate({
            where: {
                courseId: course.id,
                position,
            },
            defaults: {
                courseId: course.id,
                title: moduleData.title,
                description: `Learn about ${moduleData.title.toLowerCase()} through guided lessons and practical examples.`,
                position,
            },
        });

        for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
            const lessonData = moduleData.lessons[lessonIndex];
            const lessonPosition = lessonIndex + 1;

            await Lesson.findOrCreate({
                where: {
                    moduleId: module.id,
                    position: lessonPosition,
                },
                defaults: {
                    moduleId: module.id,
                    title: lessonData[0],
                    description: lessonData[1],
                    contentType: lessonData[2],
                    content: lessonData[1],
                    durationMinutes: 15,
                    position: lessonPosition,
                    isPreview: lessonPosition === 1 && position === 1,
                },
            });
        }
    }

    return course;
}

async function seedExternalCourse(courseData) {
    const [course] = await Course.findOrCreate({
        where: {
            title: courseData.title,
            providerType: "external",
            providerName: courseData.providerName,
        },
        defaults: {
            ...courseData,
            providerType: "external",
            isPublished: true,
        },
    });

    return course;
}

async function seedAllLearningCourses() {
    let internalCount = 0;
    let externalCount = 0;

    try {
        await sequelize.authenticate();
        console.log("Connected to PostgreSQL.");

        for (const courseData of learningCatalogue) {
            await seedInternalCourse(courseData);
            internalCount++;
            console.log(`Internal course processed: ${courseData.title}`);
        }

        for (const courseData of externalOpportunities) {
            await seedExternalCourse(courseData);
            externalCount++;
            console.log(`External course processed: ${courseData.title}`);
        }

        console.log("\nLearning catalogue seeding completed.");
        console.log(`Internal courses processed: ${internalCount}`);
        console.log(`External courses processed: ${externalCount}`);
        console.log(`Total career fields covered: ${learningCatalogue.length}`);
    } catch (error) {
        console.error("Learning catalogue seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

seedAllLearningCourses();
