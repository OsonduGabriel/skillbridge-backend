/**
 * RECOMMENDATION ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/recommendations
 *
 * Public routes:
 * - List recommendations.
 * - Retrieve a recommendation by ID.
 *
 * Authenticated routes:
 * - Retrieve personalized recommendations.
 *
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Browse and retrieve personalized learning and career recommendations
 */

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: List recommendations
 *     description: Retrieve the recommendation catalogue.
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully.
 *       500:
 *         description: Failed to retrieve recommendations.
 *
 * @swagger
 * /api/v1/recommendations/personalized:
 *   get:
 *     summary: Get personalized recommendations
 *     description: Retrieve recommendations personalized for the authenticated user.
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Failed to retrieve personalized recommendations.
 *
 * @swagger
 * /api/v1/recommendations/{id}:
 *   get:
 *     summary: Get a recommendation by ID
 *     description: Retrieve a specific recommendation using its ID.
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the recommendation.
 *     responses:
 *       200:
 *         description: Recommendation retrieved successfully.
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
