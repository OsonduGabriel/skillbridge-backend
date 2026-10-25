
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
