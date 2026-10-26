/**
 * @swagger
 * tags:
 *   - name: Skill Gap
 *     description: Create, retrieve, update, and delete skill-gap analyses
 *
 * /api/v1/skill-gaps:
 *   post:
 *     summary: Create a skill-gap analysis
 *     tags:
 *       - Skill Gap
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSkillGapRequest'
 *     responses:
 *       201:
 *         description: Skill-gap analysis created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillGapResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *
 *   get:
 *     summary: Get all skill-gap analyses for the authenticated user
 *     tags:
 *       - Skill Gap
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skill-gap analyses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillGapListResponse'
 *       401:
 *         description: Authentication required
 *
 * /api/v1/skill-gaps/{skillGapId}:
 *   get:
 *     summary: Get a skill-gap analysis by ID
 *     tags:
 *       - Skill Gap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: skillGapId
 *         in: path
 *         required: true
 *         description: ID of the skill-gap analysis
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Skill-gap analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillGapResponse'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Skill-gap analysis not found
 *
 *   patch:
 *     summary: Update a skill-gap analysis
 *     tags:
 *       - Skill Gap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: skillGapId
 *         in: path
 *         required: true
 *         description: ID of the skill-gap analysis
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSkillGapRequest'
 *     responses:
 *       200:
 *         description: Skill-gap analysis updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillGapResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Skill-gap analysis not found
 *
 *   delete:
 *     summary: Delete a skill-gap analysis
 *     tags:
 *       - Skill Gap
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: skillGapId
 *         in: path
 *         required: true
 *         description: ID of the skill-gap analysis
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Skill-gap analysis deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillGapDeleteResponse'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Skill-gap analysis not found
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
