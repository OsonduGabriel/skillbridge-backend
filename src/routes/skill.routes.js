/**
 * @swagger
 * tags:
 *   - name: Skills
 *     description: Browse the skill catalogue and manage user skills
 *
 * /api/v1/skills:
 *   get:
 *     summary: Get the skill catalogue
 *     description: Retrieve available skills from the public catalogue.
 *     tags:
 *       - Skills
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillListResponse'
 *
 *   post:
 *     summary: Create a catalogue skill
 *     description: Add a skill to the catalogue. Admin access is required.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSkillRequest'
 *     responses:
 *       201:
 *         description: Catalogue skill created successfully
 *       400:
 *         description: Invalid skill data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *
 * /api/v1/skills/me:
 *   get:
 *     summary: Get my skills
 *     description: Retrieve active catalogue skills associated with the authenticated user.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSkillListResponse'
 *       401:
 *         description: Authentication required
 *
 *   post:
 *     summary: Add a skill to my profile
 *     description: Associate an active catalogue skill with the authenticated user.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddUserSkillRequest'
 *     responses:
 *       201:
 *         description: Skill added successfully
 *       400:
 *         description: Invalid skill data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Requested skill not found or inactive
 *       409:
 *         description: Skill already exists in the user's profile
 *
 * /api/v1/skills/me/{skillId}:
 *   patch:
 *     summary: Update a skill in my profile
 *     description: Update the proficiency level of a skill associated with the authenticated user.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: skillId
 *         in: path
 *         required: true
 *         description: ID of the catalogue skill associated with the user
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserSkillRequest'
 *     responses:
 *       200:
 *         description: User skill updated successfully
 *       400:
 *         description: Invalid skill data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User skill or active catalogue skill not found
 *
 *   delete:
 *     summary: Remove a skill from my profile
 *     description: Remove a skill association belonging to the authenticated user.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: skillId
 *         in: path
 *         required: true
 *         description: ID of the catalogue skill associated with the user
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User skill removed successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User skill not found
 *
 * /api/v1/skills/{id}:
 *   patch:
 *     summary: Update a catalogue skill
 *     description: Update a skill in the catalogue. Admin access is required.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the catalogue skill
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSkillRequest'
 *     responses:
 *       200:
 *         description: Catalogue skill updated successfully
 *       400:
 *         description: Invalid skill data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Catalogue skill not found
 *
 *   delete:
 *     summary: Deactivate a catalogue skill
 *     description: Deactivate a skill in the catalogue. Admin access is required.
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the catalogue skill to deactivate
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Catalogue skill deactivated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Catalogue skill not found
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
