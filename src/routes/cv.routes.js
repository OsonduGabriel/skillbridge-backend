import express from "express";
import upload from "../middleware/upload.middleware.js";
import { uploadCV } from "../controllers/cv.controller.js";

const router = express.Router();

router.post("/upload", upload.single("cv"), uploadCV);

export default router;