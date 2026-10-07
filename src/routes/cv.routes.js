import express from "express";
import upload from "../middleware/upload.middleware.js";
import { uploadCV, getMyCVs, removeCV, updateCV, downloadCV } from "../controllers/cv.controller.js";
import { analyzeCV, getAnalysis } from "../controllers/cv.analysis.controller.js";

const router = express.Router();
//Upload CV
router.post("/upload", upload.single("cv"), uploadCV);
//users can get and view their cvs
router.get("/my-cvs", getMyCVs);
//Extract CV text and send to AI service
router.post("/:cvId/analyze", analyzeCV);
//Retrieve the saved analysis
router.get("/:cvId/analysis", getAnalysis);
//update cv
router.put("/:cvId", upload.single("cv"), updateCV);
//delete user's cv from database record and the physical file
router.delete("/:cvId", removeCV);
//download cv
router.get("/:cvId/download", downloadCV);


export default router;