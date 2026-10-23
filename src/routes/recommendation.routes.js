
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
