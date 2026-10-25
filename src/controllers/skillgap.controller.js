
import {createSkillGap, getUserSkillGaps, getSkillGapById, updateSkillGap, deleteSkillGap} from "../services/skillgap.service.js";

// Create a new skill-gap analysis
const createSkillGapController = async (req, res, next) => {
  try {
    // Get the authenticated user's ID from the auth middleware.
    const userId = req.user.id;

    // Pass the request data to the service.
    const skillGap = await createSkillGap(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Skill-gap analysis created successfully.",
      data: skillGap,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all skill-gap analyses for the user
const getMySkillGaps = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const skillGaps = await getUserSkillGaps(userId);

    return res.status(200).json({
      success: true,
      message: "Skill-gap analyses retrieved successfully.",
      data: skillGaps,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve one skill-gap analysis
const getSkillGap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skillGapId } = req.params;

    const skillGap = await getSkillGapById(skillGapId, userId);

    if (!skillGap) {
      return res.status(404).json({
        success: false,
        message: "Skill-gap analysis not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill-gap analysis retrieved successfully.",
      data: skillGap,
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing skill-gap analysis
const updateSkillGapController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skillGapId } = req.params;

    const skillGap = await updateSkillGap(skillGapId, userId, req.body);

    if (!skillGap) {
      return res.status(404).json({
        success: false,
        message: "Skill-gap analysis not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill-gap analysis updated successfully.",
      data: skillGap,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an existing skill-gap analysis
const removeSkillGap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skillGapId } = req.params;

    const deleted = await deleteSkillGap(skillGapId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Skill-gap analysis not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill-gap analysis deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export {createSkillGapController, getMySkillGaps, getSkillGap, updateSkillGapController, removeSkillGap};
