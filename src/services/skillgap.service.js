
import SkillGap from "../models/skillgap.model.js";
import CV from "../models/cv.model.js";

// Helper function for creating errors that the error middleware can handle.
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Only accept arrays for skill lists.
// This keeps the data structure consistent for the frontend and AI service.
const validateSkills = (skills, fieldName) => {
  if ( skills !== undefined && (!Array.isArray(skills) || !skills.every((skill) => typeof skill === "string"))) {

    throw createError(`${fieldName} must be an array of strings.`, 400);
  }
};

// Check whether an optional CV exists and belongs to the user.
// A valid CV ID alone is not enough; the user must own that CV.
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
    throw createError("CV not found or you do not have permission to use it.", 404);
  }
};

// function1. Create a new skill-gap analysis.
const createSkillGap = async (userId, skillGapData) => {
  const { cvId, targetJobTitle, currentSkills = [], requiredSkills = [] } = skillGapData;

  // A target role is necessary to know which skills to compare.
  if ( typeof targetJobTitle !== "string" || !targetJobTitle.trim()) {
    throw createError("Target job title is required.", 400);
  }

  // Validate skill lists before saving them.
  validateSkills(currentSkills, "currentSkills");
  validateSkills(requiredSkills, "requiredSkills");

  // If a CV is supplied, ensure it belongs to this user.
  await verifyCVOwnership(cvId, userId);

  // Create the record as pending because AI analysis has not necessarily been completed at this point.
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

// function2. Retrieve all skill-gap analyses belonging to a user.
const getUserSkillGaps = async (userId) => {
  // Filtering by userId prevents returning other users' records.
  const skillGaps = await SkillGap.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });

  return skillGaps;
};

// function3. Retrieve one analysis by ID, checking ownership.
const getSkillGapById = async (skillGapId, userId) => {
  const skillGap = await SkillGap.findOne({
    where: {
      id: skillGapId,
      userId,
    },
  });

  // Return null when no matching record belongs to this user.
  // The controller can then respond with a 404.
  return skillGap;
};

// function4. Update an existing skill-gap analysis.
const updateSkillGap = async (skillGapId, userId, updateData) => {

  const skillGap = await getSkillGapById(skillGapId, userId);

  if (!skillGap) {
    return null;
  }

  // Only allow fields that users are supposed to edit.
  // Do not accept userId, status, or analysisResult from the request.
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

  // Validate the target role if it is being changed.
  if (Object.hasOwn(updates, "targetJobTitle")) {
    if (
      typeof updates.targetJobTitle !== "string" ||
      !updates.targetJobTitle.trim()
    ) {
      throw createError("Target job title is required.", 400);
    }

    updates.targetJobTitle = updates.targetJobTitle.trim();
  }

  validateSkills(updates.currentSkills, "currentSkills");
  validateSkills(updates.requiredSkills, "requiredSkills");

  // If the CV is being changed, verify ownership of the new CV.
  if (Object.hasOwn(updates, "cvId")) {
    await verifyCVOwnership(updates.cvId, userId);
    updates.cvId = updates.cvId || null;
  }

  // Existing results are no longer guaranteed to match the
  // edited inputs, so clear them and mark the analysis pending.
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

// function5. Delete an analysis belonging to the user.
const deleteSkillGap = async (skillGapId, userId) => {
  const skillGap = await getSkillGapById(skillGapId, userId);

  if (!skillGap) {
    return false;
  }

  await skillGap.destroy();

  return true;
};

// function6. Save the result returned by the AI analysis service.
const completeSkillGapAnalysis = async (skillGapId, userId, analysisData) => {

  const skillGap = await getSkillGapById(skillGapId, userId);

  if (!skillGap) {
    return null;
  }

  const {
    currentSkills,
    requiredSkills,
    missingSkills,
    analysisResult,
  } = analysisData;

  // Validate skill lists returned by the analysis service.
  validateSkills(currentSkills, "currentSkills");
  validateSkills(requiredSkills, "requiredSkills");
  validateSkills(missingSkills, "missingSkills");

  // Save the results only when an analysis result is provided.
  if (
    analysisResult === undefined ||
    analysisResult === null
  ) {
    throw createError(
      "A completed analysis result is required.",
      400
    );
  }

  await skillGap.update({
    ...(currentSkills !== undefined && { currentSkills }),
    ...(requiredSkills !== undefined && { requiredSkills }),
    missingSkills: missingSkills ?? [],
    analysisResult,
    status: "completed",
  });

  return skillGap;
};

// 7. Mark an analysis as failed if the AI integration fails.
const failSkillGapAnalysis = async (skillGapId, userId) => {
  const skillGap = await getSkillGapById(skillGapId, userId);

  if (!skillGap) {
    return null;
  }

  await skillGap.update({
    status: "failed",
  });

  return skillGap;
};

export {
  createSkillGap,
  getUserSkillGaps,
  getSkillGapById,
  updateSkillGap,
  deleteSkillGap,
  completeSkillGapAnalysis,
  failSkillGapAnalysis,
};
