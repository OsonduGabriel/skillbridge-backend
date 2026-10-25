
/**
 * PROFILE ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/profiles
 * All profile routes require JWT authentication.
 *
 * @swagger
 * tags:
 *   name: Profile
 *   description: Retrieve and update the authenticated user's profile
 */

/**
 * @swagger
 * /api/v1/profiles/me:
 *   get:
 *     summary: Get my profile
 *     description: Retrieve the profile of the currently authenticated user.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Profile not found.
 *
 *   put:
 *     summary: Update my profile
 *     description: Update the profile of the currently authenticated user.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Profile fields accepted by the update endpoint.
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Invalid profile data.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Profile not found.
 */

import express from "express";
import {getMyProfile,updateMyProfile,} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

export default router;