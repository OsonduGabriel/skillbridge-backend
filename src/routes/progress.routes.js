/**
 * PROGRESS ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/progress
 * All progress routes require authentication.
 *
 * @swagger
 * tags:
 *   name: Progress
 *   description: Track and manage the authenticated user's learning progress
 */

/**
 * @swagger
 * /api/v1/progress:
 *   post:
 *     summary: Start a progress record
 *     description: Create a new progress record for the authenticated user.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Progress record details accepted by the endpoint.
 *     responses:
 *       201:
 *         description: Progress record created successfully.
 *       400:
 *         description: Invalid progress data.
 *       401:
 *         description: Authentication required.
 *
 *   get:
 *     summary: List my progress records
 *     description: Retrieve progress records belonging to the authenticated user.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress records retrieved successfully.
 *       401:
 *         description: Authentication required.
 *
 * @swagger
 * /api/v1/progress/{id}:
 *   get:
 *     summary: Get a progress record
 *     description: Retrieve a specific progress record belonging to the authenticated user.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the progress record.
 *     responses:
 *       200:
 *         description: Progress record retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Progress record not found.
 *
 *   patch:
 *     summary: Update a progress record
 *     description: Update an existing progress record belonging to the authenticated user.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the progress record to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Progress fields accepted by the update endpoint.
 *     responses:
 *       200:
 *         description: Progress record updated successfully.
 *       400:
 *         description: Invalid progress data.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Progress record not found.
 *
 *   delete:
 *     summary: Delete a progress record
 *     description: Remove a progress record belonging to the authenticated user.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the progress record to delete.
 *     responses:
 *       200:
 *         description: Progress record deleted successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Progress record not found.
 */

import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {startProgress,listMyProgress,getMyProgressItem,updateMyProgress,removeMyProgress,} from "../controllers/progress.controller.js";

const router = express.Router();

// All progress records belong to the authenticated user.
router.use(authenticateUser);

router.post("/", startProgress);
router.get("/", listMyProgress);
router.get("/:id", getMyProgressItem);
router.patch("/:id", updateMyProgress);
router.delete("/:id", removeMyProgress);

export default router;
