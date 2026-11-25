
import SkillGap from "../models/skillgap.model.js";
import CV from "../models/cv.model.js";

// =====================================================
// 1. COMMON HELPERS
// =====================================================

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate skill arrays.
const validateSkills = (skills, fieldName) => {
  if (
    skills !== undefined &&
    (
      !Array.isArray(skills) ||
      !skills.every(
        (skill) =>
          typeof skill === "string" &&
          skill.trim().length > 0
      )
    )
  ) {
    throw createError(
      `${fieldName} must be an array of non-empty strings.`,
      400
    );
  }
};

// Normalize equivalent skill names for comparison.
const SKILL_ALIASES = {
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

const getSkillKey = (skill) => {
  const normalized = skill
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");

  return SKILL_ALIASES[normalized] || normalized;
};

// Calculate missing skills independently of the AI response.
const calculateMissingSkills = (
  currentSkills = [],
  requiredSkills = []
) => {
  const currentSkillKeys = new Set(
    currentSkills.map(getSkillKey)
  );

  return requiredSkills.filter(
    (skill) => !currentSkillKeys.has(getSkillKey(skill))
  );
};

// Check whether an optional CV exists and belongs to the user.
const verifyCVOwnership = async (cvId, userId) => {
  if (!cvId) {
    return;
  }

  const cv = await CV.findOne({
    where: {
      id: cvId,
      userId,
    },
  });

  if (!cv) {
    throw createError(
      "CV not found or you do not have permission to use it.",
      404
    );
  }
};

// =====================================================
// 2. CREATE SKILL GAP
// =====================================================

const createSkillGap = async (userId, skillGapData) => {
  const {
    cvId,
    targetJobTitle,
    currentSkills = [],
    requiredSkills = [],
  } = skillGapData;

  if (
    typeof targetJobTitle !== "string" ||
    !targetJobTitle.trim()
  ) {
    throw createError(
      "Target job title is required.",
      400
    );
  }

  validateSkills(currentSkills, "currentSkills");
  validateSkills(requiredSkills, "requiredSkills");

  await verifyCVOwnership(cvId, userId);

  const skillGap = await SkillGap.create({
    userId,
    cvId: cvId || null,
    targetJobTitle: targetJobTitle.trim(),
    currentSkills,
    requiredSkills,
    missingSkills: [],
    analysisResult: null,
    status: "pending",
  });

  return skillGap;
};

// =====================================================
// 3. GET USER SKILL GAPS
// =====================================================

const getUserSkillGaps = async (userId) => {
  const skillGaps = await SkillGap.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });

  return skillGaps;
};

// =====================================================
// 4. GET ONE SKILL GAP
// =====================================================

const getSkillGapById = async (skillGapId, userId) => {
  const skillGap = await SkillGap.findOne({
    where: {
      id: skillGapId,
      userId,
    },
  });

  return skillGap;
};

// =====================================================
// 5. UPDATE SKILL GAP
// =====================================================

const updateSkillGap = async (
  skillGapId,
  userId,
  updateData
) => {
  const skillGap = await getSkillGapById(
    skillGapId,
    userId
  );

  if (!skillGap) {
    return null;
  }

  // Only allow fields that users are supposed to edit.
  const allowedFields = [
    "targetJobTitle",
    "currentSkills",
    "requiredSkills",
    "cvId",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(updateData, field)) {
      updates[field] = updateData[field];
    }
  }

  if (Object.hasOwn(updates, "targetJobTitle")) {
    if (
      typeof updates.targetJobTitle !== "string" ||
      !updates.targetJobTitle.trim()
    ) {
      throw createError(
        "Target job title is required.",
        400
      );
    }

    updates.targetJobTitle =
      updates.targetJobTitle.trim();
  }

  validateSkills(updates.currentSkills, "currentSkills");
  validateSkills(updates.requiredSkills, "requiredSkills");

  if (Object.hasOwn(updates, "cvId")) {
    await verifyCVOwnership(updates.cvId, userId);
    updates.cvId = updates.cvId || null;
  }

  // Changing the inputs invalidates the previous analysis.
  if (Object.keys(updates).length > 0) {
    await skillGap.update({
      ...updates,
      missingSkills: [],
      analysisResult: null,
      status: "pending",
    });
  }

  return skillGap;
};

// =====================================================
// 6. DELETE SKILL GAP
// =====================================================

const deleteSkillGap = async (skillGapId, userId) => {
  const skillGap = await getSkillGapById(
    skillGapId,
    userId
  );

  if (!skillGap) {
    return false;
  }

  await skillGap.destroy();

  return true;
};

// =====================================================
// 7. COMPLETE SKILL GAP ANALYSIS
// =====================================================

const completeSkillGapAnalysis = async (
  skillGapId,
  userId,
  analysisData
) => {
  const skillGap = await getSkillGapById(
    skillGapId,
    userId
  );

  if (!skillGap) {
    return null;
  }

  const {
    currentSkills,
    requiredSkills,
    analysisResult,
  } = analysisData;

  validateSkills(currentSkills, "currentSkills");
  validateSkills(requiredSkills, "requiredSkills");

  if (
    !Array.isArray(currentSkills) ||
    !Array.isArray(requiredSkills)
  ) {
    throw createError(
      "Current skills and required skills are required.",
      400
    );
  }

  if (
    analysisResult === undefined ||
    analysisResult === null ||
    typeof analysisResult !== "object" ||
    Array.isArray(analysisResult)
  ) {
    throw createError(
      "A valid completed analysis result is required.",
      400
    );
  }

  // Do not trust the missingSkills array supplied by callers.
  // Recalculate it using currentSkills and requiredSkills.
  const missingSkills = calculateMissingSkills(
    currentSkills,
    requiredSkills
  );

  // Keep the nested AI result consistent with the database columns.
  const correctedAnalysisResult = {
    ...analysisResult,
    identified_skills: currentSkills,
    required_skills: requiredSkills,
    skill_gaps: missingSkills,
  };

  await skillGap.update({
    currentSkills,
    requiredSkills,
    missingSkills,
    analysisResult: correctedAnalysisResult,
    status: "completed",
  });

  return skillGap;
};

// =====================================================
// 8. MARK ANALYSIS AS FAILED
// =====================================================

const failSkillGapAnalysis = async (
  skillGapId,
  userId
) => {
  const skillGap = await getSkillGapById(
    skillGapId,
    userId
  );

  if (!skillGap) {
    return null;
  }

  await skillGap.update({
    status: "failed",
  });

  return skillGap;
};

// =====================================================
// 9. EXPORT FUNCTIONS
// =====================================================

export {
  createSkillGap,
  getUserSkillGaps,
  getSkillGapById,
  updateSkillGap,
  deleteSkillGap,
  completeSkillGapAnalysis,
  failSkillGapAnalysis,
};
