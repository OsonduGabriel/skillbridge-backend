import express from "express";
import { Router } from "express";
import opportunityRoutes from "./opportunity.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import profileRoutes from "./profile.routes.js";
import skillRoutes from "./skill.routes.js";
import recommendationRoutes from "./recommendation.routes.js";
import progressRoutes from "./progress.routes.js";
import cvRoutes from "./cv.routes.js";
import skillgapRoutes from "./skillgap.routes.js";


const router = express.Router();

router.use("/opportunities", opportunityRoutes);

// Authentication
router.use("/auth", authRoutes);

// User management
router.use("/users", userRoutes);

// Profile management
router.use("/profiles", profileRoutes);

// Skills management
router.use("/skills", skillRoutes);

// Learning resources and project recommendations
router.use("/recommendations", recommendationRoutes);

// Learning progress tracking
router.use("/progress", progressRoutes);

// CV management and analysis
router.use("/cvs", cvRoutes);

// Skill-gap analysis
router.use("/skill-gaps", skillgapRoutes);

export default router;
