/**
 * CAREER MATCHING ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/matching
 * All career matching routes require JWT authentication.
 */

/**
 * @swagger
 * tags:
 *   - name: Career Matching
 *     description: Generate and retrieve career matches
 */

/**
 * @swagger
 * /api/v1/matching/generate:
 *   post:
 *     summary: Generate career matches
 *     description: >
 *       Generates and saves career matches for the authenticated user
 *       using the latest completed skill-gap analysis and currently
 *       active opportunities. Existing matches for the same user and
 *       opportunity are updated rather than duplicated. Results are
 *       returned in descending match-percentage order.
 *     tags:
 *       - Career Matching
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Career matches generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CareerMatchListResponse'
 *       400:
 *         description: >
 *           No completed skill-gap analysis exists, or the user's
 *           skill-gap analysis contains no current skills.
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
 *     description: >
 *       Retrieves completed career matches belonging to the
 *       authenticated user, including only matches whose opportunities
 *       are currently active. Results are ordered by match percentage,
 *       highest first.
 *     tags:
 *       - Career Matching
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Career matches retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CareerMatchListResponse'
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
