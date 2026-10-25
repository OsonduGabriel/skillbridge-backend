/**
 * @swagger
 * tags:
 *   name: Skill Gap
 *   description: Skill gap analysis management
 */

/**
 * @swagger
 * /api/v1/skill-gaps:
 *   post:
 *     summary: Create a skill-gap analysis
 *     description: Creates a skill-gap analysis record for the authenticated user.
 *     tags: [Skill Gap]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Skill-gap analysis created successfully.
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Internal server error.
 *
 *   get:
 *     summary: Get my skill-gap analyses
 *     description: Retrieves all skill-gap analyses belonging to the authenticated user.
 *     tags: [Skill Gap]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skill-gap analyses retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/skill-gaps/{skillGapId}:
 *   get:
 *     summary: Get a skill-gap analysis by ID
 *     description: Retrieves a specific skill-gap analysis.
 *     tags: [Skill Gap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillGapId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the skill-gap analysis.
 *     responses:
 *       200:
 *         description: Skill-gap analysis retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Skill-gap analysis not found.
 *       500:
 *         description: Internal server error.
 *
 *   patch:
 *     summary: Update a skill-gap analysis
 *     description: Updates an existing skill-gap analysis belonging to the authenticated user.
 *     tags: [Skill Gap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillGapId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the skill-gap analysis.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update. The accepted fields depend on the controller implementation.
 *     responses:
 *       200:
 *         description: Skill-gap analysis updated successfully.
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Skill-gap analysis not found.
 *       500:
 *         description: Internal server error.
 *
 *   delete:
 *     summary: Delete a skill-gap analysis
 *     description: Deletes a skill-gap analysis belonging to the authenticated user.
 *     tags: [Skill Gap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillGapId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the skill-gap analysis.
 *     responses:
 *       200:
 *         description: Skill-gap analysis deleted successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Skill-gap analysis not found.
 *       500:
 *         description: Internal server error.
 */

import express from "express";
import {createSkillGapController, getMySkillGaps, getSkillGap, updateSkillGapController, removeSkillGap} from "../controllers/skillgap.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All skill-gap endpoints require authentication.
router.use(protect);

// Create a skill-gap analysis record.
router.post("/", createSkillGapController);

// Get all skill-gap analyses belonging to the logged-in user.
router.get("/", getMySkillGaps);

// Get one skill-gap analysis by ID.
router.get("/:skillGapId", getSkillGap);

// Update a skill-gap analysis.
router.patch("/:skillGapId", updateSkillGapController);

// Delete a skill-gap analysis.
router.delete("/:skillGapId", removeSkillGap);

export default router;
