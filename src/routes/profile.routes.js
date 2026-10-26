/**
 * PROFILE ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/profiles
 * All profile routes require JWT authentication.
 *
 * @swagger
 * tags:
 *   - name: Profile
 *     description: Retrieve and update the authenticated user's profile
 */

/**
 * @swagger
 * /api/v1/profiles/me:
 *   get:
 *     summary: Get my profile
 *     description: Retrieve the authenticated user's account details and associated profile, if one exists.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileUserResponse'
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *
 *   put:
 *     summary: Update my profile
 *     description: Create a profile if one does not exist, or update the authenticated user's existing profile. Only the supported profile fields are applied.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 */


import express from "express";
import {getMyProfile,updateMyProfile,} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

export default router;