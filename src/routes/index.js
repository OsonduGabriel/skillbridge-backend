
import express from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import profileRoutes from "./profile.routes.js";
import skillRoutes from "./skill.routes.js";
import recommendationRoutes from "./recommendation.routes.js";
import progressRoutes from "./progress.routes.js";

const router = express.Router();

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

// User learning progress tracking
router.use("/progress", progressRoutes);

export default router;
