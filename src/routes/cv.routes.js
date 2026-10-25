
/**
 * CV ROUTES DOCUMENTATION
 *
 * All routes require JWT authentication.
 * Base path: /api/v1/cvs
 *
 * @swagger
 * tags:
 *   name: CV
 *   description: CV upload, management, download, and analysis
 *
 * @swagger
 * /api/v1/cvs/upload:
 *   post:
 *     summary: Upload a CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [cv]
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: CV uploaded successfully
 *       400:
 *         description: Invalid or missing file
 *       401:
 *         description: Authentication required
 *
 * @swagger
 * /api/v1/cvs/my-cvs:
 *   get:
 *     summary: Get the authenticated user's CVs
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CVs retrieved successfully
 *       401:
 *         description: Authentication required
 *
 * @swagger
 * /api/v1/cvs/{cvId}/analyze:
 *   post:
 *     summary: Analyze a CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV analysis completed successfully
 *       400:
 *         description: Invalid request or CV ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: CV not found
 *
 * @swagger
 * /api/v1/cvs/{cvId}/analysis:
 *   get:
 *     summary: Get a CV's saved analysis
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV analysis retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: CV or analysis not found
 *
 * @swagger
 * /api/v1/cvs/{cvId}/analyses:
 *   get:
 *     summary: Get CV analysis history
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV analysis history retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: CV not found
 *
 * @swagger
 * /api/v1/cvs/{cvId}:
 *   put:
 *     summary: Update a CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [cv]
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CV updated successfully
 *       400:
 *         description: Invalid or missing file
 *       401:
 *         description: Authentication required
 *       404:
 *         description: CV not found
 *
 *   delete:
 *     summary: Delete a CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: CV not found
 *
 * @swagger
 * /api/v1/cvs/{cvId}/download:
 *   get:
 *     summary: Download a CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV file returned for download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Authentication required
 *       404:
 *         description: CV or file not found
 */

import express from "express";
import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadCV, getMyCVs, removeCV, updateCV, downloadCV } from "../controllers/cv.controller.js";
import { analyzeCV, getAnalysis, getAnalysisHistory } from "../controllers/cv.analysis.controller.js";

const router = express.Router();

// Require authentication for all CV routes
router.use(protect);

//Upload CV
router.post("/upload", upload.single("cv"), uploadCV);
//users can get and view their cvs
router.get("/my-cvs", getMyCVs);
//Extract CV text and send to AI service
router.post("/:cvId/analyze", analyzeCV);
//Retrieve the saved analysis for the cv
router.get("/:cvId/analysis", getAnalysis);
//Retrieve the saved analysis history for the c
router.get("/:cvId/analyses", getAnalysisHistory)
//update cv
router.put("/:cvId", upload.single("cv"), updateCV);
//delete user's cv from database record and the physical file
router.delete("/:cvId", removeCV);
//download cv
router.get("/:cvId/download", downloadCV);


export default router;