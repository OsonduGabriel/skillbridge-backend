
import express from "express";
import {authenticateUser,authorizeRoles,} from "../middleware/auth.middleware.js";
import {getSkills,addMySkill,getMySkills,updateMySkill,removeMySkill,createSkill,updateSkill,deactivateSkill,} from "../controllers/skill.controller.js";

const router = express.Router();

// Public catalogue.
router.get("/", getSkills);

// Authenticated users manage their own skills.
router.get("/me", authenticateUser, getMySkills);
router.post("/me", authenticateUser, addMySkill);
router.patch("/me/:skillId", authenticateUser, updateMySkill);
router.delete("/me/:skillId", authenticateUser, removeMySkill);

// Admin-only catalogue management.
router.post("/", authenticateUser, authorizeRoles("admin"), createSkill);
router.patch("/:id", authenticateUser, authorizeRoles("admin"), updateSkill);
router.delete("/:id", authenticateUser, authorizeRoles("admin"), deactivateSkill);

export default router;
