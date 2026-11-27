
import { Op } from "sequelize";

import Recommendation from "../models/recommendation.model.js";
import Skill from "../models/skill.model.js";
import SkillGap from "../models/skillgap.model.js";

// Normalize skill names to handle common variations.
const normalizeSkill = (skill) => {
  if (typeof skill !== "string") return "";

  const normalized = skill
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

// Retrieve active recommendations.
export const getRecommendations = async (filters = {}) => {
  const where = {
    isActive: true,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.skillId) {
    where.skillId = filters.skillId;
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

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

// Retrieve recommendations that address the user's missing skills.
export const getPersonalizedRecommendations = async (userId) => {
  // Get the user's latest completed skill-gap analysis.
  const skillGap = await SkillGap.findOne({
    where: {
      userId,
      status: "completed",
    },
    order: [["createdAt", "DESC"]],
  });

  if (!skillGap) {
    return [];
  }

  // Normalize the missing skills from the analysis.
  const missingSkills = [
    ...new Set(
      (skillGap.missingSkills || [])
        .map(normalizeSkill)
        .filter(Boolean)
    ),
  ];

  if (missingSkills.length === 0) {
    return [];
  }

  // Retrieve active skills from the catalogue.
  const skills = await Skill.findAll({
    where: {
      isActive: true,
    },
    attributes: ["id", "name", "category"],
  });

  // Match missing skills against the skills catalogue.
  const matchingSkills = skills.filter((skill) =>
    missingSkills.includes(normalizeSkill(skill.name))
  );

  const skillIds = matchingSkills.map((skill) => skill.id);

  if (skillIds.length === 0) {
    return [];
  }

  // Retrieve active resources linked to missing skills.
  const recommendations = await Recommendation.findAll({
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

  // Attach relevance information to each recommendation.
  return recommendations
    .map((item) => {
      const recommendation = item.toJSON();

      const normalizedSkill = normalizeSkill(
        recommendation.skill.name
      );

      const addressesSkillGap = missingSkills.includes(
        normalizedSkill
      );

      return {
        ...recommendation,
        relevanceScore: addressesSkillGap ? 100 : 0,
        addressesSkillGap,
        targetRole: skillGap.targetJobTitle,
      };
    })
    .filter((item) => item.addressesSkillGap)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};
