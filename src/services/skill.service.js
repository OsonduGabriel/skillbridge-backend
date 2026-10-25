
import * as Skill from "../models/skill.model.js";
import UserSkill from "../models/UserSkill.model.js";
import SkillModel from "../models/skill.model.js";

export const makeError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const formatUserSkill = (row) => {
  if (!row) return null;

  const skill = row.skill;

  return {
    skillId: row.skillId,
    name: skill?.name,
    description: skill?.description,
    category: skill?.category,
    proficiencyLevel: row.proficiencyLevel,
    addedAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const getSkills = (filters) => Skill.findAll(filters);

export const createSkill = (data) => Skill.create(data);

export const updateSkill = (id, data) => Skill.update(id, data);

export const deactivateSkill = (id) => Skill.deactivate(id);

export const getMySkills = async (userId) => {
  const rows = await UserSkill.findAll({
    where: { userId },
    include: [
      {
        model: SkillModel,
        as: "skill",
        where: { isActive: true },
        required: true,
      },
    ],
    order: [[{ model: SkillModel, as: "skill" }, "name", "ASC"]],
  });

  return rows.map(formatUserSkill);
};

export const addMySkill = async (
  userId,
  skillId,
  proficiencyLevel
) => {
  const skill = await Skill.findActiveById(skillId);

  if (!skill) {
    throw makeError(
      "SKILL_NOT_FOUND",
      "The requested skill does not exist or is inactive."
    );
  }

  const [assignment, created] = await UserSkill.findOrCreate({
    where: { userId, skillId },
    defaults: { userId, skillId, proficiencyLevel },
  });

  if (!created) {
    throw makeError(
      "USER_SKILL_EXISTS",
      "This skill is already in your profile."
    );
  }

  const result = await UserSkill.findOne({
    where: { userId, skillId },
    include: [{ model: SkillModel, as: "skill" }],
  });

  return formatUserSkill(result ?? assignment);
};

export const updateMySkill = async (
  userId,
  skillId,
  proficiencyLevel
) => {
  const skill = await Skill.findActiveById(skillId);

  if (!skill) return null;

  const [updated] = await UserSkill.update(
    { proficiencyLevel },
    { where: { userId, skillId } }
  );

  if (!updated) return null;

  const row = await UserSkill.findOne({
    where: { userId, skillId },
    include: [{ model: SkillModel, as: "skill" }],
  });

  return formatUserSkill(row);
};

export const removeMySkill = async (userId, skillId) => {
  const deleted = await UserSkill.destroy({
    where: { userId, skillId },
  });

  return deleted > 0;
};
