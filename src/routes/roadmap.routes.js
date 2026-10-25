/**
 * CAREER ROADMAP ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/roadmaps
 * All roadmap routes require JWT authentication.
 *
 * @swagger
 * tags:
 *   name: Career Roadmap
 *   description: Generate and manage career learning roadmaps and tasks
 */

/**
 * @swagger
 * /api/v1/roadmaps/generate:
 *   post:
 *     summary: Generate a career roadmap
 *     description: Generate a roadmap for the authenticated user using the supplied details.
 *     tags: [Career Roadmap]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Roadmap generation details required by the application.
 *     responses:
 *       200:
 *         description: Roadmap generated successfully.
 *       201:
 *         description: Roadmap created successfully.
 *       400:
 *         description: Invalid roadmap generation data.
 *       401:
 *         description: Authentication required.
 *
 * @swagger
 * /api/v1/roadmaps:
 *   get:
 *     summary: List my roadmaps
 *     description: Retrieve roadmaps belonging to the authenticated user.
 *     tags: [Career Roadmap]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roadmaps retrieved successfully.
 *       401:
 *         description: Authentication required.
 *
 * @swagger
 * /api/v1/roadmaps/{id}:
 *   get:
 *     summary: Get a roadmap by ID
 *     tags: [Career Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the roadmap.
 *     responses:
 *       200:
 *         description: Roadmap retrieved successfully.
 *       400:
 *         description: Invalid roadmap ID.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Roadmap not found.
 *
 *   patch:
 *     summary: Update a roadmap
 *     description: Update an existing roadmap belonging to the authenticated user.
 *     tags: [Career Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the roadmap to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Roadmap fields accepted by the update endpoint.
 *     responses:
 *       200:
 *         description: Roadmap updated successfully.
 *       400:
 *         description: Invalid roadmap data.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Roadmap not found.
 *
 *   delete:
 *     summary: Delete a roadmap
 *     description: Delete a roadmap belonging to the authenticated user.
 *     tags: [Career Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the roadmap to delete.
 *     responses:
 *       200:
 *         description: Roadmap deleted successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Roadmap not found.
 *
 * @swagger
 * /api/v1/roadmaps/{id}/tasks:
 *   post:
 *     summary: Create a roadmap task
 *     description: Add a task to a roadmap belonging to the authenticated user.
 *     tags: [Career Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the roadmap.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Roadmap task details required by the application.
 *     responses:
 *       201:
 *         description: Roadmap task created successfully.
 *       400:
 *         description: Invalid task data.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Roadmap not found.
 *
 * @swagger
 * /api/v1/roadmaps/{id}/tasks/{taskId}:
 *   patch:
 *     summary: Update a roadmap task
 *     description: Update a task within the specified roadmap.
 *     tags: [Career Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the roadmap.
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the task to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Task fields accepted by the update endpoint.
 *     responses:
 *       200:
 *         description: Roadmap task updated successfully.
 *       400:
 *         description: Invalid roadmap or task data.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Roadmap or task not found.
 *
 *   delete:
 *     summary: Delete a roadmap task
 *     description: Remove a task from the specified roadmap.
 *     tags: [Career Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the roadmap.
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the task to delete.
 *     responses:
 *       200:
 *         description: Roadmap task deleted successfully.
 *       400:
 *         description: Invalid roadmap or task ID.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Roadmap or task not found.
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
