
/**
 * SKILL ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/skills
 *
 * Public:
 * - Browse the skill catalogue.
 *
 * Authenticated users:
 * - View, add, update, and remove their own skills.
 *
 * Admin:
 * - Create, update, and deactivate catalogue skills.
 *
 * @swagger
 * tags:
 *   name: Skills
 *   description: Browse the skill catalogue and manage user skills
 */

/**
 * @swagger
 * /api/v1/skills:
 *   get:
 *     summary: Get the skill catalogue
 *     description: Retrieve available skills from the public catalogue.
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: Skills retrieved successfully.
 *       500:
 *         description: Failed to retrieve skills.
 *
 *   post:
 *     summary: Create a catalogue skill
 *     description: Add a skill to the catalogue. Admin access is required.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Skill details required by the application.
 *     responses:
 *       201:
 *         description: Skill created successfully.
 *       400:
 *         description: Invalid skill data.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *
 * @swagger
 * /api/v1/skills/me:
 *   get:
 *     summary: Get my skills
 *     description: Retrieve skills associated with the authenticated user.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User skills retrieved successfully.
 *       401:
 *         description: Authentication required.
 *
 *   post:
 *     summary: Add a skill to my profile
 *     description: Associate a skill with the authenticated user.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: User skill details required by the application.
 *     responses:
 *       201:
 *         description: Skill added successfully.
 *       400:
 *         description: Invalid skill data.
 *       401:
 *         description: Authentication required.
 *
 * @swagger
 * /api/v1/skills/me/{skillId}:
 *   patch:
 *     summary: Update one of my skills
 *     description: Update a skill associated with the authenticated user.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user's skill record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: User skill fields accepted by the update endpoint.
 *     responses:
 *       200:
 *         description: User skill updated successfully.
 *       400:
 *         description: Invalid skill data.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User skill not found.
 *
 *   delete:
 *     summary: Remove a skill from my profile
 *     description: Remove a skill associated with the authenticated user.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user's skill record.
 *     responses:
 *       200:
 *         description: User skill removed successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User skill not found.
 *
 * @swagger
 * /api/v1/skills/{id}:
 *   patch:
 *     summary: Update a catalogue skill
 *     description: Update a skill in the catalogue. Admin access is required.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the catalogue skill.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Catalogue skill fields accepted by the update endpoint.
 *     responses:
 *       200:
 *         description: Catalogue skill updated successfully.
 *       400:
 *         description: Invalid skill data.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Skill not found.
 *
 *   delete:
 *     summary: Deactivate a catalogue skill
 *     description: Deactivate a skill in the catalogue. Admin access is required.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the catalogue skill to deactivate.
 *     responses:
 *       200:
 *         description: Catalogue skill deactivated successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Skill not found.
 */

import express from "express";
import {authenticateUser,authorizeRoles,} from "../middleware/auth.middleware.js";
import {getSkills,addMySkill,getMySkills,updateMySkill,removeMySkill,createSkill,updateSkill,deactivateSkill,} from "../controllers/skill.controller.js";

const router = express.Router();

// Public catalogue.
router.get("/", getSkills);

// Authenticated users manage their own skills.
router.get("/me", authenticateUser, getMySkills);
router.post("/me", authenticateUser, addMySkill);
router.patch("/me/:skillId", authenticateUser, updateMySkill);
router.delete("/me/:skillId", authenticateUser, removeMySkill);

// Admin-only catalogue management.
router.post("/", authenticateUser, authorizeRoles("admin"), createSkill);
router.patch("/:id", authenticateUser, authorizeRoles("admin"), updateSkill);
router.delete("/:id", authenticateUser, authorizeRoles("admin"), deactivateSkill);

export default router;
