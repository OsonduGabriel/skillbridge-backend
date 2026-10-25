
import {
  createProgress,
  getMyProgress,
  getProgressById,
  updateProgress,
  deleteProgress,
} from "../services/progress.service.js";

const validStatuses = ["not_started", "in_progress", "completed"];

export const startProgress = async (req, res, next) => {
  try {
    const recommendationId = Number(req.body.recommendationId);

    if (
      !Number.isSafeInteger(recommendationId) ||
      recommendationId < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "recommendationId must be a positive integer.",
      });
    }

    const progress = await createProgress(req.user.id, recommendationId);

    return res.status(201).json({
      success: true,
      message: "Progress tracking started.",
      data: progress,
    });
  } catch (error) {
    if (error.code === "RECOMMENDATION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === "PROGRESS_EXISTS") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const listMyProgress = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress status.",
      });
    }

    const progress = await getMyProgress(req.user.id, { status });

    return res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProgressItem = async (req, res, next) => {
  try {
    const progress = await getProgressById(req.user.id, req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProgress = async (req, res, next) => {
  try {
    const { status, progressPercentage } = req.body;

    if (status === undefined && progressPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide status or progressPercentage to update.",
      });
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress status.",
      });
    }

    if (
      progressPercentage !== undefined &&
      (!Number.isInteger(progressPercentage) ||
        progressPercentage < 0 ||
        progressPercentage > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "progressPercentage must be an integer from 0 to 100.",
      });
    }

    const updates = {};

    if (status !== undefined) updates.status = status;
    if (progressPercentage !== undefined) {
      updates.progressPercentage = progressPercentage;
    }

    const progress = await updateProgress(
      req.user.id,
      req.params.id,
      updates
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully.",
      data: progress,
    });
  } catch (error) {
    if (error.code === "INVALID_PROGRESS") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const removeMyProgress = async (req, res, next) => {
  try {
    const deleted = await deleteProgress(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Progress tracking removed.",
    });
  } catch (error) {
    next(error);
  }
};
