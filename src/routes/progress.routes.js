
/**
 * @swagger
 * tags:
 *   - name: Progress
 *     description: Track and manage the authenticated user's learning progress
 */

/**
 * @swagger
 * /api/v1/progress:
 *   post:
 *     summary: Start progress tracking
 *     description: Start tracking an active recommendation for the authenticated user.
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProgressRequest'
 *     responses:
 *       201:
 *         description: Progress tracking started.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressResponse'
 *       400:
 *         description: recommendationId must be a positive integer.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Recommendation not found or inactive.
 *       409:
 *         description: Progress tracking already exists for this recommendation.
 *
 *   get:
 *     summary: List my progress records
 *     description: Retrieve the authenticated user's progress records, optionally filtered by status.
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *         description: Filter progress records by status.
 *     responses:
 *       200:
 *         description: Progress records retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressListResponse'
 *       400:
 *         description: Invalid progress status.
 *       401:
 *         description: Authentication required.
 *
 * /api/v1/progress/{id}:
 *   get:
 *     summary: Get a progress record
 *     description: Retrieve one progress record belonging to the authenticated user.
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the progress record.
 *     responses:
 *       200:
 *         description: Progress record retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressResponse'
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Progress record not found.
 *
 *   patch:
 *     summary: Update a progress record
 *     description: Update the status or completion percentage of the authenticated user's progress record.
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the progress record to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProgressRequest'
 *     responses:
 *       200:
 *         description: Progress updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressResponse'
 *       400:
 *         description: Invalid status, invalid percentage, missing update fields, or invalid completion percentage.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Progress record not found.
 *
 *   delete:
 *     summary: Delete a progress record
 *     description: Remove a progress record belonging to the authenticated user.
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the progress record to delete.
 *     responses:
 *       200:
 *         description: Progress tracking removed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressDeleteResponse'
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
