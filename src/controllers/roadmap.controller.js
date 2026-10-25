import * as roadmapService from "../services/roadmap.service.js";
import { successResponse } from "../utils/response.js";

export const generateRoadmap = async (req, res) => {
  const roadmap = await roadmapService.generateRoadmap(
    req.user.id,
    req.body.skillGapId,
  );
  return successResponse(res, 201, "Roadmap generated successfully", roadmap);
};

export const listRoadmaps = async (req, res) => {
  const roadmaps = await roadmapService.listRoadmaps(req.user.id);
  return successResponse(res, 200, "Roadmaps retrieved successfully", {
    items: roadmaps,
  });
};

export const getRoadmap = async (req, res) => {
  const roadmap = await roadmapService.getRoadmap(req.user.id, req.params.id);
  const data = roadmap.toJSON();
  const tasks = data.tasks || [];
  delete data.tasks;
  data.tasksByPhase = { 30: [], 60: [], 90: [] };
  for (const task of tasks) data.tasksByPhase[task.phase].push(task);
  return successResponse(res, 200, "Roadmap retrieved successfully", data);
};

export const updateRoadmap = async (req, res) => {
  const roadmap = await roadmapService.updateRoadmap(
    req.user.id,
    req.params.id,
    req.body,
  );
  return successResponse(res, 200, "Roadmap updated successfully", roadmap);
};

export const deleteRoadmap = async (req, res) => {
  await roadmapService.deleteRoadmap(req.user.id, req.params.id);
  return successResponse(res, 200, "Roadmap deleted successfully", null);
};

export const createRoadmapTask = async (req, res) => {
  const task = await roadmapService.createRoadmapTask(
    req.user.id,
    req.params.id,
    req.body,
  );
  return successResponse(res, 201, "Roadmap task created successfully", task);
};

export const updateRoadmapTask = async (req, res) => {
  const task = await roadmapService.updateRoadmapTask(
    req.user.id,
    req.params.id,
    req.params.taskId,
    req.body,
  );
  return successResponse(res, 200, "Roadmap task updated successfully", task);
};

export const deleteRoadmapTask = async (req, res) => {
  await roadmapService.deleteRoadmapTask(
    req.user.id,
    req.params.id,
    req.params.taskId,
  );
  return successResponse(res, 200, "Roadmap task deleted successfully", null);
};
