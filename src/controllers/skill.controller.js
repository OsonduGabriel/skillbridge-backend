
import * as SkillService from "../services/skill.service.js";
import {
  skillSchema,
  skillUpdateSchema,
  skillSearchSchema,
  addUserSkillSchema,
  updateUserSkillSchema,
} from "../validators/skill.validator.js";

const parseId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const sendValidationError = (res, error) =>
  res.status(400).json({
    success: false,
    message: "Invalid request data.",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });

const sendServerError = (res, message, error) => {
  console.error(message, error);

  if (
    error?.name === "SequelizeUniqueConstraintError" ||
    error?.name === "SequelizeUniqueConstraintError" ||
    error?.code === "23505"
  ) {
    return res.status(409).json({
      success: false,
      message: "A skill or user-skill assignment already exists.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};

export const getSkills = async (req, res) => {
  const validation = skillSearchSchema.safeParse(req.query);

  if (!validation.success) {
    return sendValidationError(res, validation.error);
  }

  try {
    const skills = await SkillService.getSkills({
      search: validation.data.q,
      category: validation.data.category,
    });

    return res.status(200).json({
      success: true,
      count: skills.length,
      data: { skills },
    });
  } catch (error) {
    return sendServerError(res, "Get skills error:", error);
  }
};

export const createSkill = async (req, res) => {
  const validation = skillSchema.safeParse(req.body);

  if (!validation.success) {
    return sendValidationError(res, validation.error);
  }

  try {
    const skill = await SkillService.createSkill(validation.data);

    return res.status(201).json({
      success: true,
      message: "Skill created successfully.",
      data: { skill },
    });
  } catch (error) {
    return sendServerError(res, "Create skill error:", error);
  }
};

export const updateSkill = async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid skill ID.",
    });
  }

  const validation = skillUpdateSchema.safeParse(req.body);

  if (!validation.success) {
    return sendValidationError(res, validation.error);
  }

  try {
    const skill = await SkillService.updateSkill(id, validation.data);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Active skill not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully.",
      data: { skill },
    });
  } catch (error) {
    return sendServerError(res, "Update skill error:", error);
  }
};

export const deactivateSkill = async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid skill ID.",
    });
  }

  try {
    const skill = await SkillService.deactivateSkill(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Active skill not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill deactivated successfully.",
      data: { skill },
    });
  } catch (error) {
    return sendServerError(res, "Deactivate skill error:", error);
  }
};

export const getMySkills = async (req, res) => {
  try {
    const skills = await SkillService.getMySkills(req.user.id);

    return res.status(200).json({
      success: true,
      count: skills.length,
      data: { skills },
    });
  } catch (error) {
    return sendServerError(res, "Get user skills error:", error);
  }
};

export const addMySkill = async (req, res) => {
  const validation = addUserSkillSchema.safeParse(req.body);

  if (!validation.success) {
    return sendValidationError(res, validation.error);
  }

  try {
    const { skillId, proficiencyLevel } = validation.data;

    const skill = await SkillService.addMySkill(
      req.user.id,
      skillId,
      proficiencyLevel
    );

    return res.status(201).json({
      success: true,
      message: "Skill added to your profile.",
      data: { skill },
    });
  } catch (error) {
    if (error.code === "SKILL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === "USER_SKILL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return sendServerError(res, "Add user skill error:", error);
  }
};

export const updateMySkill = async (req, res) => {
  const skillId = parseId(req.params.skillId);

  if (!skillId) {
    return res.status(400).json({
      success: false,
      message: "Invalid skill ID.",
    });
  }

  const validation = updateUserSkillSchema.safeParse(req.body);

  if (!validation.success) {
    return sendValidationError(res, validation.error);
  }

  try {
    const skill = await SkillService.updateMySkill(
      req.user.id,
      skillId,
      validation.data.proficiencyLevel
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Active skill not found in your profile.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill proficiency updated.",
      data: { skill },
    });
  } catch (error) {
    return sendServerError(res, "Update user skill error:", error);
  }
};

export const removeMySkill = async (req, res) => {
  const skillId = parseId(req.params.skillId);

  if (!skillId) {
    return res.status(400).json({
      success: false,
      message: "Invalid skill ID.",
    });
  }

  try {
    const removed = await SkillService.removeMySkill(
      req.user.id,
      skillId
    );

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Skill not found in your profile.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill removed from your profile.",
    });
  } catch (error) {
    return sendServerError(res, "Remove user skill error:", error);
  }
};
