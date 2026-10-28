
/**
 * @swagger
 * tags:
 *   - name: Recommendations
 *     description: Browse and retrieve personalized learning and career recommendations
 */

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: List recommendations
 *     description: Retrieve active recommendations, with optional filters for type, skill, and difficulty.
 *     tags:
 *       - Recommendations
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [learning_resource, project]
 *         description: Filter recommendations by type.
 *       - in: query
 *         name: skillId
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter recommendations by a positive skill ID.
 *       - in: query
 *         name: difficulty
 *         required: false
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter recommendations by difficulty level.
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendationListResponse'
 *       400:
 *         description: Invalid recommendation type, difficulty, or skill ID.
 *       500:
 *         description: Failed to retrieve recommendations.
 */

/**
 * @swagger
 * /api/v1/recommendations/personalized:
 *   get:
 *     summary: Get personalized recommendations
 *     description: Retrieve active recommendations ranked by relevance to the authenticated user's skills.
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonalizedRecommendationListResponse'
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Failed to retrieve personalized recommendations.
 */

/**
 * @swagger
 * /api/v1/recommendations/{id}:
 *   get:
 *     summary: Get a recommendation by ID
 *     description: Retrieve a single active recommendation using its positive integer ID.
 *     tags:
 *       - Recommendations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Positive integer ID of the recommendation.
 *     responses:
 *       200:
 *         description: Recommendation retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendationResponse'
 *       400:
 *         description: Recommendation ID must be a positive integer.
 *       404:
 *         description: Recommendation not found.
 *       500:
 *         description: Failed to retrieve recommendation.
 */



import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {listRecommendations,getRecommendation, getPersonalized,} from "../controllers/recommendation.controller.js";

const router = express.Router();

// Public recommendation catalogue.
router.get("/", listRecommendations);

// Personalized recommendations require authentication.
router.get("/personalized", authenticateUser, getPersonalized);

// Get one recommendation by ID.
router.get("/:id", getRecommendation);

export default router;
