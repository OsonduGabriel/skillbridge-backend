
import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {startProgress,listMyProgress,getMyProgressItem,updateMyProgress,removeMyProgress,} from "../controllers/progress.controller.js";

const router = express.Router();

// All progress records belong to the authenticated user.
router.use(authenticateUser);

router.post("/", startProgress);
router.get("/", listMyProgress);
router.get("/:id", getMyProgressItem);
router.patch("/:id", updateMyProgress);
router.delete("/:id", removeMyProgress);

export default router;
