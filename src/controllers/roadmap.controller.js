
import * as roadmapService from "../services/roadmap.service.js";
import { successResponse } from "../utils/response.js";

// Generate a roadmap from a completed skill-gap analysis.
export const generateRoadmap = async (req, res, next) => {
  try {
    const { skillGapId } = req.body;

    if (!skillGapId) {
      return res.status(400).json({
        success: false,
        message: "Skill gap ID is required.",
      });
    }

    const roadmap = await roadmapService.generateRoadmap(
      req.user.id,
      skillGapId
    );

    return successResponse(
      res,
      201,
      "Roadmap generated successfully",
      roadmap
    );
  } catch (error) {
    next(error);
  }
};

// Retrieve all roadmaps belonging to the authenticated user.
export const listRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await roadmapService.listRoadmaps(req.user.id);

    return successResponse(
      res,
      200,
      "Roadmaps retrieved successfully",
      {
        items: roadmaps,
      }
    );
  } catch (error) {
    next(error);
  }
};

// Retrieve one roadmap and organize its tasks by learning phase.
export const getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await roadmapService.getRoadmap(
      req.user.id,
      req.params.id
    );

    const data = roadmap.toJSON();
    const tasks = data.tasks || [];

    const tasksByPhase = {
      30: [],
      60: [],
      90: [],
    };

    for (const task of tasks) {
      const phase = Number(task.phase);

      if (tasksByPhase[phase]) {
        tasksByPhase[phase].push(task);
      }
    }

    data.tasks = tasks;
    data.tasksByPhase = tasksByPhase;

    return successResponse(
      res,
      200,
      "Roadmap retrieved successfully",
      data
    );
  } catch (error) {
    next(error);
  }
};

// Update roadmap information.
export const updateRoadmap = async (req, res, next) => {
  try {
    const roadmap = await roadmapService.updateRoadmap(
      req.user.id,
      req.params.id,
      req.body
    );

    return successResponse(
      res,
      200,
      "Roadmap updated successfully",
      roadmap
    );
  } catch (error) {
    next(error);
  }
};

// Delete a roadmap.
export const deleteRoadmap = async (req, res, next) => {
  try {
    await roadmapService.deleteRoadmap(
      req.user.id,
      req.params.id
    );

    return successResponse(
      res,
      200,
      "Roadmap deleted successfully",
      null
    );
  } catch (error) {
    next(error);
  }
};

// Create a task inside a roadmap.
export const createRoadmapTask = async (req, res, next) => {
  try {
    const task = await roadmapService.createRoadmapTask(
      req.user.id,
      req.params.id,
      req.body
    );

    return successResponse(
      res,
      201,
      "Roadmap task created successfully",
      task
    );
  } catch (error) {
    next(error);
  }
};

// Update a roadmap task.
export const updateRoadmapTask = async (req, res, next) => {
  try {
    const task = await roadmapService.updateRoadmapTask(
      req.user.id,
      req.params.id,
      req.params.taskId,
      req.body
    );

    return successResponse(
      res,
      200,
      "Roadmap task updated successfully",
      task
    );
  } catch (error) {
    next(error);
  }
};

// Delete a roadmap task.
export const deleteRoadmapTask = async (req, res, next) => {
  try {
    await roadmapService.deleteRoadmapTask(
      req.user.id,
      req.params.id,
      req.params.taskId
    );

    return successResponse(
      res,
      200,
      "Roadmap task deleted successfully",
      null
    );
  } catch (error) {
    next(error);
  }
};
