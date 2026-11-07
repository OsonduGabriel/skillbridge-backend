
import Matching from "../models/matching.model.js";
import Opportunity from "../models/opportunity.model.js";
import SkillGap from "../models/skillgap.model.js";
import { runJobMatchingFromDatabase } from "./ai.service.js";

// Create an error with an HTTP status code.
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Normalize skill names to make comparisons consistent.
// Example: "Node.js" and " node.js " become "node.js".
const normalizeSkill = (skill) => {
  return skill.trim().toLowerCase();
};

// Validate and normalize a list of skills.
const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return [
    ...new Set(
      skills
        .filter(
          (skill) =>
            typeof skill === "string" && skill.trim().length > 0
        )
        .map(normalizeSkill)
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

  // Find required skills the user already possesses.
  const matchedRequiredSkills = requiredSkills.filter((skill) =>
    userSkills.includes(skill)
  );

  // Find preferred skills the user already possesses.
  const matchedPreferredSkills = preferredSkills.filter((skill) =>
    userSkills.includes(skill)
  );

  // Identify missing required skills.
  const missingSkills = requiredSkills.filter(
    (skill) => !userSkills.includes(skill)
  );

  let score = 0;

  // Required skills carry 80% of the score when both
  // required and preferred skills are available.
  if (requiredSkills.length > 0 && preferredSkills.length > 0) {
    const requiredScore =
      (matchedRequiredSkills.length / requiredSkills.length) * 80;

    const preferredScore =
      (matchedPreferredSkills.length / preferredSkills.length) * 20;

    score = requiredScore + preferredScore;
  } else if (requiredSkills.length > 0) {
    // If no preferred skills exist, use required skills alone.
    score =
      (matchedRequiredSkills.length / requiredSkills.length) * 100;
  } else if (preferredSkills.length > 0) {
    // If no required skills exist, use preferred skills alone.
    score =
      (matchedPreferredSkills.length / preferredSkills.length) * 100;
  }

  const matchPercentage = Math.round(score);

  const matchedSkills = [
    ...new Set([
      ...matchedRequiredSkills,
      ...matchedPreferredSkills,
    ]),
  ];

  const explanation =
    `You match ${matchedRequiredSkills.length} of ` +
    `${requiredSkills.length} required skills and ` +
    `${matchedPreferredSkills.length} of ` +
    `${preferredSkills.length} preferred skills. ` +
    (missingSkills.length > 0
      ? `Skills to develop: ${missingSkills.join(", ")}.`
      : "You have all the listed required skills.");

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    explanation,
  };
};

// Generate and save matching results for a user.
const generateCareerMatches = async (userId) => {
  // Get the user's latest completed SkillGap analysis.
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

  // Use the skills identified in the SkillGap record.
  const userSkills = normalizeSkills(skillGap.currentSkills);

  if (userSkills.length === 0) {
    throw createError(
      "No user skills were found. Update your skills or complete a new CV analysis.",
      400
    );
  }

  // Retrieve currently active opportunities.
  const opportunities = await Opportunity.findAll({
    where: {
      status: "active",
    },
  });

  if (opportunities.length === 0) {
    return [];
  }

  const results = [];

  for (const opportunity of opportunities) {
    const match = calculateMatch(userSkills, opportunity);

    // Find an existing match for this user and opportunity.
    let savedMatch = await Matching.findOne({
      where: {
        userId,
        opportunityId: opportunity.id,
      },
    });

    const matchData = {
      userId,
      opportunityId: opportunity.id,
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      explanation: match.explanation,
      status: "completed",
    };

    // Update an existing result instead of creating duplicates.
    if (savedMatch) {
      await savedMatch.update(matchData);
    } else {
      savedMatch = await Matching.create(matchData);
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
const getUserCareerMatches = async (userId) => {
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
        },
      },
    ],
    order: [["matchPercentage", "DESC"]],
  });

  return matches;
};

export const generateAIMatches = async (userId) => {
  // 1. Get the candidate's latest completed skill gap analysis
  const skillGap = await SkillGap.findOne({
    where: {
      userId,
      status: "completed",
    },
    order: [["createdAt", "DESC"]],
  });

  if (!skillGap) {
    throw createError(
      "Complete a CV skill gap analysis before generating job matches.",
      404
    );
  }

  // 2. Get the candidate's skills
  const candidateProfile = {
    targetRole: skillGap.targetJobTitle,
    skills: skillGap.currentSkills || [],
    seniorityLevel: skillGap.careerStage || "Entry",
  };

  // 3. Get active opportunities from the database
  const activeJobs = await Opportunity.findAll({
    where: {
      status: "active",
    },
    attributes: [
      "id",
      "title",
      "company",
      "description",
      "type",
      "category",
      "location",
      "workMode",
      "applicationUrl",
      "requiredSkills",
      "preferredSkills",
    ],
  });

  if (activeJobs.length === 0) {
    throw createError(
      "There are currently no active opportunities available.",
      404
    );
  }

  // 4. Convert Sequelize records into plain objects for Gemini
  const jobsForAI = activeJobs.map((job) => ({
    job_id: job.id,
    job_title: job.title,
    company_name: job.company,
    description: job.description,
    opportunity_type: job.type,
    category: job.category,
    location: job.location,
    work_mode: job.workMode,
    required_skills: job.requiredSkills || [],
    preferred_skills: job.preferredSkills || [],
    apply_link: job.applicationUrl,
  }));

  // 5. Send candidate profile and opportunities to Gemini
  const aiResult = await runJobMatchingFromDatabase(
    candidateProfile,
    jobsForAI
  );

  // 6. Match AI results against actual database opportunities.
  // This prevents the AI from introducing unknown opportunity IDs.
  const opportunityMap = new Map(
    activeJobs.map((job) => [job.id, job])
  );

  const savedMatches = [];

  for (const aiMatch of aiResult.matched_jobs) {
    const opportunity = opportunityMap.get(aiMatch.job_id);

    if (!opportunity) {
      continue;
    }

    const percentage = Number(aiMatch.match_percentage);

    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      continue;
    }

    const matchedSkills = Array.isArray(aiMatch.matching_skills)
      ? aiMatch.matching_skills.filter(
        (skill) => typeof skill === "string"
      )
      : [];

    const missingSkills = Array.isArray(aiMatch.missing_skills)
      ? aiMatch.missing_skills.filter(
        (skill) => typeof skill === "string"
      )
      : [];

    // 7. Save or update the user's match
    const [matching] = await Matching.findOrCreate({
      where: {
        userId,
        opportunityId: opportunity.id,
      },
      defaults: {
        userId,
        opportunityId: opportunity.id,
        matchPercentage: Math.round(percentage),
        matchedSkills,
        missingSkills,
        explanation: aiMatch.why_good_fit || "",
        status: "completed",
      },
    });

    if (matching) {
      await matching.update({
        matchPercentage: Math.round(percentage),
        matchedSkills,
        missingSkills,
        explanation: aiMatch.why_good_fit || "",
        status: "completed",
      });
    }

    savedMatches.push(matching);
  }

  // 8. Return saved matches with their opportunity details
  const matches = await Matching.findAll({
    where: {
      userId,
      status: "completed",
    },
    include: [
      {
        model: Opportunity,
        as: "opportunity",
        where: {
          status: "active",
        },
      },
    ],
    order: [["matchPercentage", "DESC"]],
  });

  return {
    total_matches_found: matches.length,
    matches,
  };
};

export {
  calculateMatch,
  generateCareerMatches,
  getUserCareerMatches,
};
