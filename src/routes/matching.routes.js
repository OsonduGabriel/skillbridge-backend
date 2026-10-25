/**
 * CAREER MATCHING ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/matching
 * All career matching routes require JWT authentication.
 *
 * @swagger
 * tags:
 *   name: Career Matching
 *   description: Generate and retrieve career matches
 */

/**
 * @swagger
 * /api/v1/matching/generate:
 *   post:
 *     summary: Generate career matches
 *     description: Generate and save career matches for the authenticated user.
 *     tags: [Career Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Career matches generated successfully.
 *       201:
 *         description: Career matches created successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Failed to generate career matches.
 */

/**
 * @swagger
 * /api/v1/matching:
 *   get:
 *     summary: Get saved career matches
 *     description: Retrieve career matches belonging to the authenticated user.
 *     tags: [Career Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Career matches retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Failed to retrieve career matches.
 */

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { generateMatches,  getMyMatches} from "../controllers/matching.controller.js";

const router = express.Router();

// All career matching routes require authentication.
router.use(protect);

// Generate and save career matches.
router.post("/generate", generateMatches);

// Retrieve the logged-in user's saved matches.
router.get("/", getMyMatches);

export default router;
