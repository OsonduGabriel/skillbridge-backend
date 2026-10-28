/**
 * @swagger
 * tags:
 *   - name: Career Roadmap
 *     description: Generate and manage career learning roadmaps and tasks
 *
 * /api/v1/roadmaps/generate:
 *   post:
 *     summary: Generate a career roadmap
 *     description: Generate a roadmap for the authenticated user using a skill-gap analysis. Generation is currently unavailable until an AI provider is selected.
 *     tags:
 *       - Career Roadmap
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateRoadmapRequest'
 *     responses:
 *       503:
 *         description: Roadmap generation is unavailable until an AI provider is selected
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Skill-gap analysis not found
 *
 * /api/v1/roadmaps:
 *   get:
 *     summary: List my roadmaps
 *     description: Retrieve roadmaps belonging to the authenticated user, ordered by creation date.
 *     tags:
 *       - Career Roadmap
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roadmaps retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoadmapListResponse'
 *       401:
 *         description: Authentication required
 *
 * /api/v1/roadmaps/{id}:
 *   get:
 *     summary: Get a roadmap by ID
 *     description: Retrieve a roadmap and its tasks, ordered by phase and position.
 *     tags:
 *       - Career Roadmap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the roadmap
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Roadmap retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoadmapResponse'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Roadmap not found
 *
 *   patch:
 *     summary: Update a roadmap
 *     description: Update permitted fields of a roadmap belonging to the authenticated user.
 *     tags:
 *       - Career Roadmap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the roadmap to update
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoadmapRequest'
 *     responses:
 *       200:
 *         description: Roadmap updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoadmapResponse'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Roadmap not found
 *
 *   delete:
 *     summary: Delete a roadmap
 *     description: Delete a roadmap belonging to the authenticated user.
 *     tags:
 *       - Career Roadmap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the roadmap to delete
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Roadmap deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Roadmap not found
 *
 * /api/v1/roadmaps/{id}/tasks:
 *   post:
 *     summary: Create a roadmap task
 *     description: Add a task to a roadmap belonging to the authenticated user.
 *     tags:
 *       - Career Roadmap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the roadmap
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoadmapTaskRequest'
 *     responses:
 *       201:
 *         description: Roadmap task created successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Roadmap not found
 *       422:
 *         description: Invalid task values or skill-gap association
 *
 * /api/v1/roadmaps/{id}/tasks/{taskId}:
 *   patch:
 *     summary: Update a roadmap task
 *     description: Update a task belonging to the specified roadmap.
 *     tags:
 *       - Career Roadmap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the roadmap
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to update
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoadmapTaskRequest'
 *     responses:
 *       200:
 *         description: Roadmap task updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Roadmap or task not found
 *       422:
 *         description: Invalid task values or skill-gap association
 *
 *   delete:
 *     summary: Delete a roadmap task
 *     description: Remove a task from the specified roadmap.
 *     tags:
 *       - Career Roadmap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the roadmap
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to delete
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Roadmap task deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Roadmap or task not found
 */

import { Router } from "express";
import * as controller from "../controllers/roadmap.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createRoadmapTaskRules,
  generateRoadmapRules,
  roadmapIdRules,
  roadmapTaskIdRules,
  updateRoadmapRules,
  updateRoadmapTaskRules,
} from "../validators/roadmap.validator.js";

const router = Router();

router.use(protect);

router.post("/generate", generateRoadmapRules, validate, controller.generateRoadmap);
router.get("/", controller.listRoadmaps);
router.get("/:id", roadmapIdRules, validate, controller.getRoadmap);
router.patch(
  "/:id",
  updateRoadmapRules,
  validate,
  controller.updateRoadmap,
);
router.delete("/:id", roadmapIdRules, validate, controller.deleteRoadmap);
router.post(
  "/:id/tasks",
  createRoadmapTaskRules,
  validate,
  controller.createRoadmapTask,
);
router.patch(
  "/:id/tasks/:taskId",
  updateRoadmapTaskRules,
  validate,
  controller.updateRoadmapTask,
);
router.delete(
  "/:id/tasks/:taskId",
  roadmapTaskIdRules,
  validate,
  controller.deleteRoadmapTask,
);

export default router;
