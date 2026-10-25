import express from "express";
import {getMe,updateMe,deleteMe, getCurrentUser,getAdminDashboard} from "../controllers/user.controller.js";
import {protect,authorizeRoles} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);
router.get("/current", protect, getCurrentUser);

router.get("/admin",protect,authorizeRoles("admin"), getAdminDashboard);

export default router;