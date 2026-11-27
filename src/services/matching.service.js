
import { Op } from "sequelize";

import Matching from "../models/matching.model.js";
import Opportunity from "../models/opportunity.model.js";
import SkillGap from "../models/skillgap.model.js";

// Create an error with an HTTP status code.
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Normalize skill names to handle common variations.
const normalizeSkill = (skill) => {
  if (typeof skill !== "string") {
    return "";
  }

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

// Validate and normalize a list of skills.
const normalizeSkills = (skills = []) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return [
    ...new Set(
      skills
        .map(normalizeSkill)
        .filter(Boolean)
    ),
  ];
};

// Calculate the match score for one opportunity.
const calculateMatch = (userSkills, opportunity) => {
  const requiredSkills = normalizeSkills(
    opportunity.requiredSkills
  );

  const preferredSkills = normalizeSkills(
    opportunity.preferredSkills
  );

  const candidateSkills = normalizeSkills(userSkills);

  // Identify matched required skills.
  const matchedRequiredSkills = requiredSkills.filter(
    (skill) => candidateSkills.includes(skill)
  );

  // Identify matched preferred skills.
  const matchedPreferredSkills = preferredSkills.filter(
    (skill) => candidateSkills.includes(skill)
  );

  // Identify missing required skills.
  const missingRequiredSkills = requiredSkills.filter(
    (skill) => !candidateSkills.includes(skill)
  );

  // Identify missing preferred skills.
  const missingPreferredSkills = preferredSkills.filter(
    (skill) => !candidateSkills.includes(skill)
  );

  let score = 0;

  // Required skills carry 80% and preferred skills carry 20%.
  if (requiredSkills.length > 0 && preferredSkills.length > 0) {
    const requiredScore =
      (matchedRequiredSkills.length / requiredSkills.length) * 80;

    const preferredScore =
      (matchedPreferredSkills.length / preferredSkills.length) * 20;

    score = requiredScore + preferredScore;
  } else if (requiredSkills.length > 0) {
    score =
      (matchedRequiredSkills.length / requiredSkills.length) * 100;
  } else if (preferredSkills.length > 0) {
    score =
      (matchedPreferredSkills.length / preferredSkills.length) * 100;
  }

  const matchedSkills = [
    ...new Set([
      ...matchedRequiredSkills,
      ...matchedPreferredSkills,
    ]),
  ];

  const missingSkills = [
    ...new Set([
      ...missingRequiredSkills,
      ...missingPreferredSkills,
    ]),
  ];

  const matchPercentage = Math.round(score);

  const explanation =
    `You match ${matchedRequiredSkills.length} of ` +
    `${requiredSkills.length} required skills and ` +
    `${matchedPreferredSkills.length} of ` +
    `${preferredSkills.length} preferred skills. ` +
    (missingRequiredSkills.length > 0
      ? `Required skills to develop: ${missingRequiredSkills.join(", ")}.`
      : "You have all the listed required skills.");

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    explanation,
  };
};

// Retrieve the user's latest completed skill-gap analysis.
const getLatestSkillGap = async (userId) => {
  const skillGap = await SkillGap.findOne({
    where: {
      userId,
      status: "completed",
    },
    order: [["createdAt", "DESC"]],
  });

  if (!skillGap) {
    throw createError(
      "Complete a skill-gap analysis before generating career matches.",
      400
    );
  }

  return skillGap;
};

// Retrieve active opportunities.
const getActiveOpportunities = async () => {
  return Opportunity.findAll({
    where: {
      status: "active",
      [Op.or]: [
        { deadline: null },
        { deadline: { [Op.gte]: new Date() } },
      ],
    },
  });
};

// Remove old completed matches for opportunities that are no longer
// eligible for matching.
const removeStaleMatches = async (userId, activeOpportunityIds) => {
  const where = {
    userId,
    status: "completed",
  };

  if (activeOpportunityIds.length > 0) {
    where.opportunityId = {
      [Op.notIn]: activeOpportunityIds,
    };
  }

  await Matching.destroy({ where });
};

// Generate and save deterministic career matches.
export const generateCareerMatches = async (userId) => {
  const skillGap = await getLatestSkillGap(userId);

  const userSkills = normalizeSkills(
    skillGap.currentSkills || []
  );

  if (userSkills.length === 0) {
    throw createError(
      "No user skills were found. Update your skills or complete a new CV analysis.",
      400
    );
  }

  const opportunities = await getActiveOpportunities();

  const activeOpportunityIds = opportunities.map(
    (opportunity) => opportunity.id
  );

  // Remove matches that are no longer eligible.
  await removeStaleMatches(userId, activeOpportunityIds);

  if (opportunities.length === 0) {
    return [];
  }

  const results = [];

  for (const opportunity of opportunities) {
    const match = calculateMatch(userSkills, opportunity);

    const matchData = {
      userId,
      opportunityId: opportunity.id,
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      explanation: match.explanation,
      status: "completed",
    };

    // Update an existing match or create a new one.
    const [savedMatch, created] = await Matching.findOrCreate({
      where: {
        userId,
        opportunityId: opportunity.id,
      },
      defaults: matchData,
    });

    if (!created) {
      await savedMatch.update(matchData);
    }

    results.push({
      ...savedMatch.toJSON(),
      opportunity: opportunity.toJSON(),
    });
  }

  // Return the strongest matches first.
  results.sort(
    (a, b) => b.matchPercentage - a.matchPercentage
  );

  return results;
};

// Retrieve previously saved matches for one user.
export const getUserCareerMatches = async (userId) => {
  const matches = await Matching.findAll({
    where: {
      userId,
      status: "completed",
    },
    include: [
      {
        model: Opportunity,
        as: "opportunity",
        required: true,
        where: {
          status: "active",
          [Op.or]: [
            { deadline: null },
            { deadline: { [Op.gte]: new Date() } },
          ],
        },
      },
    ],
    order: [["matchPercentage", "DESC"]],
  });

  return matches;
};

// Retain the existing function name for compatibility with
// controllers that call generateAIMatches.
//
// Match percentages and skill comparisons are calculated by the
// deterministic matching algorithm, not generated by Gemini.
export const generateAIMatches = async (userId) => {
  const matches = await generateCareerMatches(userId);

  return {
    total_matches_found: matches.length,
    matches,
  };
};

export {
  calculateMatch,
  normalizeSkill,
  normalizeSkills,
};
