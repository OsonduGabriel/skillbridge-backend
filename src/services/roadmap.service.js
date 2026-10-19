import sequelize from "../config/database.js";
import Roadmap, { ROADMAP_STATUSES } from "../models/roadmap.model.js";
import RoadmapTask, {
  ROADMAP_PHASES,
  ROADMAP_TASK_STATUSES,
  ROADMAP_TASK_TYPES,
} from "../models/roadmap-task.model.js";

const TASK_WRITABLE_FIELDS = [
  "phase",
  "position",
  "title",
  "description",
  "taskType",
  "skill",
  "recommendationId",
  "resourceUrl",
  "estimatedHours",
  "dueDate",
  "status",
];

const pickTaskFields = (payload) =>
  Object.fromEntries(
    TASK_WRITABLE_FIELDS
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]]),
  );

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getRoadmapForUser = async (userId, roadmapId, options = {}) => {
  const roadmap = await Roadmap.findOne({
    where: { id: roadmapId, userId },
    ...options,
  });
  if (!roadmap) throw httpError(404, "Roadmap not found");
  return roadmap;
};

const getOwnedSkillGap = async (userId, skillGapId) => {
  const SkillGap = sequelize.models.SkillGap;
  if (!SkillGap) {
    throw httpError(503, "Skill gap integration is unavailable");
  }

  const skillGap = await SkillGap.findOne({ where: { id: skillGapId, userId } });
  if (!skillGap) throw httpError(404, "Skill gap not found");
  return skillGap;
};

const assertSkillBelongsToGap = async (userId, skillGapId, skill) => {
  if (!skill) return;
  if (!skillGapId) {
    throw httpError(422, "A task skill requires a linked skill gap");
  }

  const skillGap = await getOwnedSkillGap(userId, skillGapId);
  const missingSkills = Array.isArray(skillGap.missingSkills)
    ? skillGap.missingSkills
        .filter((item) => typeof item === "string")
        .map((item) => item.toLowerCase())
    : [];
  if (!missingSkills.includes(skill)) {
    throw httpError(422, "Task skill must be in the linked skill gap's missingSkills");
  }
};

const assertTaskValues = (values) => {
  if (values.phase !== undefined && !ROADMAP_PHASES.includes(Number(values.phase))) {
    throw httpError(422, "Task phase must be 30, 60, or 90");
  }
  if (
    values.taskType !== undefined &&
    !ROADMAP_TASK_TYPES.includes(values.taskType)
  ) {
    throw httpError(422, "Invalid task type");
  }
  if (
    values.status !== undefined &&
    !ROADMAP_TASK_STATUSES.includes(values.status)
  ) {
    throw httpError(422, "Invalid task status");
  }
};

export const generateRoadmap = async (userId, skillGapId) => {
  await getOwnedSkillGap(userId, skillGapId);
  throw httpError(503, "Roadmap generation is unavailable until an AI provider is selected");
};

export const listRoadmaps = (userId) =>
  Roadmap.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });

export const getRoadmap = async (userId, roadmapId) =>
  getRoadmapForUser(userId, roadmapId, {
    include: [{ model: RoadmapTask, as: "tasks", separate: true, order: [["phase", "ASC"], ["position", "ASC"]] }],
  });

export const updateRoadmap = async (userId, roadmapId, payload) => {
  const roadmap = await getRoadmapForUser(userId, roadmapId);
  const allowedFields = ["title", "targetRole", "summary", "status", "startDate"];
  const changes = Object.fromEntries(
    allowedFields
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]]),
  );
  if (changes.status && !ROADMAP_STATUSES.includes(changes.status)) {
    throw httpError(422, "Invalid roadmap status");
  }
  return roadmap.update(changes);
};

export const deleteRoadmap = async (userId, roadmapId) => {
  const roadmap = await getRoadmapForUser(userId, roadmapId);
  await roadmap.destroy();
};

export const createRoadmapTask = async (userId, roadmapId, payload) => {
  const roadmap = await getRoadmapForUser(userId, roadmapId);
  const values = pickTaskFields(payload);
  assertTaskValues(values);
  await assertSkillBelongsToGap(userId, roadmap.skillGapId, values.skill);

  const position =
    values.position ??
    (await RoadmapTask.max("position", {
      where: { roadmapId, phase: values.phase },
    })) + 1;
  return RoadmapTask.create({
    ...values,
    position,
    roadmapId,
    completedAt: values.status === "done" ? new Date() : null,
  });
};

export const updateRoadmapTask = async (
  userId,
  roadmapId,
  taskId,
  payload,
) => {
  const roadmap = await getRoadmapForUser(userId, roadmapId);
  const task = await RoadmapTask.findOne({ where: { id: taskId, roadmapId } });
  if (!task) throw httpError(404, "Roadmap task not found");

  const changes = pickTaskFields(payload);
  assertTaskValues(changes);
  if (changes.skill !== undefined) {
    await assertSkillBelongsToGap(userId, roadmap.skillGapId, changes.skill);
  }

  if (changes.status !== undefined) {
    changes.completedAt =
      changes.status === "done" ? task.completedAt || new Date() : null;
  }
  return task.update(changes);
};

export const deleteRoadmapTask = async (userId, roadmapId, taskId) => {
  await getRoadmapForUser(userId, roadmapId);
  const task = await RoadmapTask.findOne({ where: { id: taskId, roadmapId } });
  if (!task) throw httpError(404, "Roadmap task not found");
  await task.destroy();
};

export const setTaskStatus = async (userId, taskId, status) => {
  if (!ROADMAP_TASK_STATUSES.includes(status)) {
    throw httpError(422, "Invalid task status");
  }

  const task = await RoadmapTask.findByPk(taskId);
  if (!task) throw httpError(404, "Roadmap task not found");
  await getRoadmapForUser(userId, task.roadmapId);
  return task.update({
    status,
    completedAt: status === "done" ? task.completedAt || new Date() : null,
  });
};
