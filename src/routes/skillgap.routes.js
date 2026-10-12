import express from "express";
import {createSkillGapController, getMySkillGaps, getSkillGap, updateSkillGapController, removeSkillGap} from "../controllers/skillgap.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All skill-gap endpoints require authentication.
router.use(protect);

// Create a skill-gap analysis record.
router.post("/", createSkillGapController);

// Get all skill-gap analyses belonging to the logged-in user.
router.get("/", getMySkillGaps);

// Get one skill-gap analysis by ID.
router.get("/:skillGapId", getSkillGap);

// Update a skill-gap analysis.
router.patch("/:skillGapId", updateSkillGapController);

// Delete a skill-gap analysis.
router.delete("/:skillGapId", removeSkillGap);

export default router;
