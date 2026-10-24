
import Progress from "../models/progress.model.js";
import Recommendation from "../models/recommendation.model.js";
import Skill from "../models/skill.model.js";

const progressIncludes = [
  {
    model: Recommendation,
    as: "recommendation",
    include: [
      {
        model: Skill,
        as: "skill",
        attributes: ["id", "name", "category"],
        required: true,
      },
    ],
  },
];

export const createProgress = async (userId, recommendationId) => {
  const recommendation = await Recommendation.findOne({
    where: {
      id: recommendationId,
      isActive: true,
    },
  });

  if (!recommendation) {
    const error = new Error("Recommendation not found or inactive.");
    error.code = "RECOMMENDATION_NOT_FOUND";
    throw error;
  }

  const existing = await Progress.findOne({
    where: { userId, recommendationId },
  });

  if (existing) {
    const error = new Error("You are already tracking this item.");
    error.code = "PROGRESS_EXISTS";
    throw error;
  }

  return Progress.create({
    userId,
    recommendationId,
    status: "not_started",
    progressPercentage: 0,
  });
};

export const getMyProgress = async (userId, filters = {}) => {
  const where = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  return Progress.findAll({
    where,
    include: progressIncludes,
    order: [["updatedAt", "DESC"]],
  });
};

export const getProgressById = async (userId, id) => {
  return Progress.findOne({
    where: { id, userId },
    include: progressIncludes,
  });
};

export const updateProgress = async (userId, id, updates) => {
  const progress = await Progress.findOne({
    where: { id, userId },
  });

  if (!progress) {
    return null;
  }

  const nextStatus = updates.status ?? progress.status;
  const nextPercentage =
    updates.progressPercentage ?? progress.progressPercentage;

  if (
    nextStatus === "completed" &&
    updates.progressPercentage !== undefined &&
    updates.progressPercentage !== 100
  ) {
    const error = new Error(
      "Completed items must have progressPercentage set to 100."
    );
    error.code = "INVALID_PROGRESS";
    throw error;
  }

  if (nextStatus === "completed") {
    updates.progressPercentage = 100;
    updates.completedAt = progress.completedAt ?? new Date();
  } else {
    updates.completedAt = null;
  }

  if (
    nextStatus === "in_progress" &&
    !progress.startedAt
  ) {
    updates.startedAt = new Date();
  }

  if (
    nextStatus === "not_started" &&
    nextPercentage > 0 &&
    updates.progressPercentage === undefined
  ) {
    updates.progressPercentage = nextPercentage;
  }

  await progress.update(updates);

  return getProgressById(userId, id);
};

export const deleteProgress = async (userId, id) => {
  const deleted = await Progress.destroy({
    where: { id, userId },
  });

  return deleted > 0;
};
