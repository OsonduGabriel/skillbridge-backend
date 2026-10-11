import express from "express";
import { register,login,} from "../controllers/auth.controller.js";
import {forgotPassword,verifyResetCode,resetPassword,} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
