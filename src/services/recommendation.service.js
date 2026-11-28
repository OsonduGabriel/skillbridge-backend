
import { Op } from "sequelize";
import Course from "../models/course.model.js";
import Recommendation from "../models/recommendation.model.js";
import Skill from "../models/skill.model.js";
import SkillGap from "../models/skillgap.model.js";
import Profile from "../models/profile.model.js";

// Normalize skill names and common variations.
const normalizeSkill = (value) => {
  if (typeof value !== "string") return "";

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");

  const aliases = {
    express: "expressjs",
    expressjs: "expressjs",
    react: "reactjs",
    reactjs: "reactjs",
    node: "nodejs",
    nodejs: "nodejs",
    postgres: "postgresql",
    postgresql: "postgresql",
    js: "javascript",
    javascript: "javascript",
    html5: "html",
    html: "html",
    css3: "css",
    css: "css",
  };

  return aliases[normalized] || normalized;
};

// Infer a learning field from the user's target career.
const inferCareerField = (targetJobTitle = "") => {
  const role = targetJobTitle.toLowerCase();

  const careerFields = [
    {
      field: "Technology & Software Development",
      keywords: [
        "backend",
        "frontend",
        "full stack",
        "software developer",
        "software engineer",
        "web developer",
        "mobile developer",
        "programmer",
        "devops",
        "cloud engineer",
        "qa engineer",
        "test engineer",
      ],
    },
    {
      field: "Data & Artificial Intelligence",
      keywords: [
        "data scientist",
        "data analyst",
        "data engineer",
        "machine learning",
        "artificial intelligence",
        "ai engineer",
        "business intelligence",
      ],
    },
    {
      field: "Cybersecurity & Networking",
      keywords: [
        "cybersecurity",
        "security analyst",
        "network engineer",
        "network administrator",
        "penetration tester",
      ],
    },
    {
      field: "Design & Creative Arts",
      keywords: [
        "designer",
        "ui",
        "ux",
        "graphic",
        "illustrator",
        "animator",
        "creative",
      ],
    },
    {
      field: "Business & Management",
      keywords: [
        "business analyst",
        "business manager",
        "project manager",
        "product manager",
        "operations manager",
        "entrepreneur",
      ],
    },
    {
      field: "Marketing & Communications",
      keywords: [
        "marketing",
        "digital marketer",
        "seo",
        "content writer",
        "communications",
        "social media",
      ],
    },
    {
      field: "Engineering & Manufacturing",
      keywords: [
        "mechanical engineer",
        "civil engineer",
        "electrical engineer",
        "manufacturing",
        "industrial engineer",
        "cad",
      ],
    },
    {
      field: "Healthcare & Life Sciences",
      keywords: [
        "doctor",
        "nurse",
        "healthcare",
        "medical",
        "pharmacist",
        "clinical",
        "public health",
      ],
    },
    {
      field: "Finance & Accounting",
      keywords: [
        "accountant",
        "accounting",
        "finance",
        "financial analyst",
        "auditor",
        "banker",
      ],
    },
    {
      field: "Education & Training",
      keywords: [
        "teacher",
        "educator",
        "lecturer",
        "tutor",
        "trainer",
        "instructional designer",
      ],
    },
    {
      field: "Agriculture & Environmental Science",
      keywords: [
        "agriculture",
        "agricultural",
        "agronomist",
        "farmer",
        "environmental scientist",
        "environmental engineer",
      ],
    },
    {
      field: "Law & Professional Services",
      keywords: [
        "lawyer",
        "legal",
        "solicitor",
        "barrister",
        "paralegal",
        "compliance officer",
      ],
    },
  ];

  return (
    careerFields.find(({ keywords }) =>
      keywords.some((keyword) => role.includes(keyword))
    )?.field || null
  );
};


const careerFocusKeywords = {
  "Technology & Software Development": [
    "backend development",
    "frontend development",
    "programming",
    "software development",
    "rest api",
    "database",
    "application security",
    "testing",
    "deployment",
    "system design",
  ],

  "Data & Artificial Intelligence": [
    "data analysis",
    "statistics",
    "data visualization",
    "machine learning",
    "artificial intelligence",
    "python",
    "data science",
  ],

  "Cybersecurity & Networking": [
    "networking",
    "network protocols",
    "cybersecurity",
    "security threats",
    "access control",
    "incident response",
  ],

  "Design & Creative Arts": [
    "visual design",
    "graphic design",
    "user experience",
    "wireframing",
    "prototyping",
    "design tools",
    "portfolio",
  ],

  "Business & Management": [
    "business planning",
    "business models",
    "leadership",
    "project management",
    "operations management",
    "teamwork",
  ],

  "Marketing & Communications": [
    "digital marketing",
    "content marketing",
    "social media",
    "search engine optimization",
    "marketing analytics",
    "campaign measurement",
  ],

  "Engineering & Manufacturing": [
    "engineering",
    "technical drawing",
    "manufacturing",
    "cad",
    "quality control",
    "engineering mathematics",
    "safety",
  ],

  "Healthcare & Life Sciences": [
    "healthcare systems",
    "public health",
    "disease prevention",
    "health information",
    "health research",
    "health communication",
  ],

  "Finance & Accounting": [
    "bookkeeping",
    "accounting",
    "financial statements",
    "financial analysis",
    "budgeting",
    "financial reporting",
  ],

  "Education & Training": [
    "teaching",
    "lesson planning",
    "assessment",
    "instructional design",
    "e-learning",
    "learning materials",
  ],

  "Agriculture & Environmental Science": [
    "agriculture",
    "crop production",
    "soil management",
    "sustainable farming",
    "water management",
    "environmental science",
  ],

  "Law & Professional Services": [
    "legal research",
    "legal systems",
    "professional ethics",
    "case management",
    "client relations",
    "critical thinking",
  ],
};

// Check whether a skill is meaningfully mentioned in course text.
const normalizeSearchText = (value) => {
  const aliases = {
    express: "expressjs",
    react: "reactjs",
    node: "nodejs",
    postgres: "postgresql",
    js: "javascript",
    html5: "html",
    css3: "css",
  };

  return String(value || "")
    .toLowerCase()
    .replace(/\bnode\.js\b/g, "nodejs")
    .replace(/\bexpress\.js\b/g, "expressjs")
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => aliases[word] || word)
    .join(" ");
};

const getCourseSearchText = (course) => {
  const parts = [
    course.title,
    course.description,
    course.field,
    course.category,
  ];

  for (const module of course.modules || []) {
    parts.push(module.title, module.description);

    for (const lesson of module.lessons || []) {
      parts.push(
        lesson.title,
        lesson.description,
        lesson.content
      );
    }
  }

  return normalizeSearchText(parts.filter(Boolean).join(" "));
};

const courseMatchesSkill = (course, skill) => {
  const normalizedText = getCourseSearchText(course);
  const normalizedSkill = normalizeSearchText(skill);

  if (normalizedSkill.length < 3) return false;

  const escapedSkill = normalizedSkill
    .split(" ")
    .map((word) =>
      word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .join("\\s+");

  const pattern = new RegExp(
    `(?:^|\\s)${escapedSkill}s?(?:$|\\s)`
  );

  return pattern.test(normalizedText);
};



// Retrieve active recommendations.
export const getRecommendations = async (filters = {}) => {
  const where = {
    isActive: true,
  };

  if (filters.type) where.type = filters.type;
  if (filters.skillId) where.skillId = filters.skillId;
  if (filters.difficulty) where.difficulty = filters.difficulty;

  return Recommendation.findAll({
    where,
    include: [
      {
        model: Skill,
        as: "skill",
        attributes: ["id", "name", "category"],
        required: true,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// Retrieve one active recommendation.
export const getRecommendationById = async (id) => {
  return Recommendation.findOne({
    where: {
      id,
      isActive: true,
    },
    include: [
      {
        model: Skill,
        as: "skill",
        attributes: ["id", "name", "category"],
        required: true,
      },
    ],
  });
};

// Retrieve personalized learning recommendations.

export const getPersonalizedRecommendations = async (userId) => {
  // Retrieve the user's latest completed CV skill-gap analysis.
  const skillGap = await SkillGap.findOne({
    where: {
      userId,
      status: "completed",
    },
    order: [["createdAt", "DESC"]],
  });

  // Retrieve the user's career profile.
  const profile = await Profile.findOne({
    where: { userId },
    attributes: [
      "targetJobTitle",
      "industryFocus",
      "careerStage",
      "primaryGoal",
    ],
  });

  // Prefer the career target from the completed analysis.
  // Fall back to the user's saved profile.
  const targetRole =
    skillGap?.targetJobTitle ||
    profile?.targetJobTitle ||
    profile?.industryFocus ||
    null;

  const targetField =
    inferCareerField(targetRole || "") ||
    Object.keys(careerFocusKeywords).find(
      (field) =>
        field.toLowerCase() ===
        (profile?.industryFocus || "").trim().toLowerCase()
    ) ||
    null;

  // Use missing skills when a completed analysis exists.
  // Otherwise, provide career-based recommendations.
  const missingSkills = [
    ...new Set(
      (skillGap?.missingSkills || [])
        .map(normalizeSkill)
        .filter(Boolean)
    ),
  ];

  // Find catalogue skills matching the user's missing skills.
  const skills = await Skill.findAll({
    where: {
      isActive: true,
    },
    attributes: ["id", "name", "category"],
  });

  const matchingSkills = skills.filter((skill) =>
    missingSkills.includes(normalizeSkill(skill.name))
  );

  const skillIds = matchingSkills.map((skill) => skill.id);

  // Retrieve existing learning resources and projects.
  let recommendations = [];

  if (skillIds.length > 0) {
    const existingRecommendations = await Recommendation.findAll({
      where: {
        isActive: true,
        skillId: {
          [Op.in]: skillIds,
        },
      },
      include: [
        {
          model: Skill,
          as: "skill",
          attributes: ["id", "name", "category"],
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    recommendations = existingRecommendations.map((item) => ({
      ...item.toJSON(),
      recommendationKind: "existing_resource",
      relevanceScore: 100,
      addressesSkillGap: true,
      targetRole,
    }));
  }

  // Retrieve all published courses.

  const availableCourses = await Course.findAll({
    where: {
      isPublished: true,
    },
    attributes: [
      "id",
      "title",
      "description",
      "field",
      "category",
      "difficulty",
      "providerType",
      "providerName",
      "externalUrl",
      "thumbnailUrl",
      "estimatedHours",
    ],
    include: [
      {
        association: "modules",
        attributes: ["title", "description"],
        required: false,
        include: [
          {
            association: "lessons",
            attributes: ["title", "description", "content"],
            required: false,
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });



  // Match courses using missing skills, career focus topics,
  // and the user's target career field.
  const focusKeywords = targetField
    ? careerFocusKeywords[targetField] || []
    : [];

  const courses = availableCourses
    .map((course) => {
      const courseData = course.toJSON();

      const matchedSkills = missingSkills.filter((skill) =>
        courseMatchesSkill(courseData, skill)
      );

      const matchedFocusTopics = focusKeywords.filter((topic) =>
        courseMatchesSkill(courseData, topic)
      );

      const matchesCareerField =
        Boolean(targetField) &&
        courseData.field?.trim().toLowerCase() ===
        targetField.toLowerCase();

      if (
        !matchesCareerField &&
        matchedSkills.length === 0 &&
        matchedFocusTopics.length === 0
      ) {
        return null;
      }
      const hasSkillGap = missingSkills.length > 0;

      // When CV analysis exists, prioritize missing skills.
      // Without CV analysis, prioritize career interests.
      const skillScore = hasSkillGap
        ? (matchedSkills.length / missingSkills.length) * 60
        : 0;

      const focusWeight = hasSkillGap ? 30 : 60;

      const focusScore =
        focusKeywords.length > 0
          ? (matchedFocusTopics.length / focusKeywords.length) *
          focusWeight
          : 0;

      const fieldWeight = hasSkillGap ? 10 : 40;

      const fieldScore = matchesCareerField ? fieldWeight : 0;

      const relevanceScore = Math.min(
        100,
        Math.round(skillScore + focusScore + fieldScore)
      );

      const reasons = [];

      if (matchedSkills.length > 0) {
        reasons.push(
          `Addresses missing skills: ${matchedSkills.join(", ")}`
        );
      }

      if (matchedFocusTopics.length > 0) {
        reasons.push(
          `Covers career topics: ${matchedFocusTopics.join(", ")}`
        );
      }

      if (matchesCareerField) {
        reasons.push("Relevant to your target career field");
      }

      return {
        ...courseData,
        recommendationKind: "course",
        matchedSkills,
        matchedFocusTopics,
        matchesCareerField,
        relevanceScore,
        recommendationReasons: reasons,
        addressesSkillGap: matchedSkills.length > 0,
        targetRole,
        targetField,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      if (b.matchedSkills.length !== a.matchedSkills.length) {
        return b.matchedSkills.length - a.matchedSkills.length;
      }

      return (
        b.matchedFocusTopics.length -
        a.matchedFocusTopics.length
      );
    });

  return {
    targetRole,
    targetField,
    missingSkills,
    recommendations,
    courses,
  };
};
