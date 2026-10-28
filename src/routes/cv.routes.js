/**
 * @swagger
 * tags:
 *   - name: CV
 *     description: CV upload, management, download, and analysis
 */

/**
 * @swagger
 * /api/v1/cvs/upload:
 *   post:
 *     summary: Upload a CV
 *     description: Upload a CV file for the authenticated user.
 *     tags:
 *       - CV
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CVUploadRequest'
 *     responses:
 *       201:
 *         description: CV uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CVResponse'
 *       400:
 *         description: No CV file was provided.
 *       401:
 *         description: Authentication required.
 */

/**
 * @swagger
 * /api/v1/cvs/my-cvs:
 *   get:
 *     summary: Get the authenticated user's CVs
 *     description: Retrieves the user's uploaded CVs, newest first.
 *     tags:
 *       - CV
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CVs retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CVListResponse'
 *       401:
 *         description: Authentication required.
 */

/**
 * @swagger
 * /api/v1/cvs/{cvId}/analyze:
 *   post:
 *     summary: Analyze a CV
 *     description: Extracts CV text, sanitizes personal information, and saves the analysis and skill-gap results. Currently, only Gap Analysis is supported.
 *     tags:
 *       - CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CVId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CVAnalysisRequest'
 *     responses:
 *       201:
 *         description: CV skill-gap analysis completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CVAnalysisCreatedResponse'
 *       400:
 *         description: Invalid analysis input or no readable CV text.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: CV not found or does not belong to the authenticated user.
 *       501:
 *         description: The requested analysis goal is not currently supported.
 *       502:
 *         description: AI analysis failed or returned an invalid response.
 */

/**
 * @swagger
 * /api/v1/cvs/{cvId}/analysis:
 *   get:
 *     summary: Get the latest CV analysis
 *     description: Retrieves the most recently created analysis for a CV owned by the authenticated user.
 *     tags:
 *       - CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CVId'
 *     responses:
 *       200:
 *         description: CV analysis retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CVAnalysisResponse'
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: CV or analysis not found.
 */

/**
 * @swagger
 * /api/v1/cvs/{cvId}/analyses:
 *   get:
 *     summary: Get CV analysis history
 *     description: Retrieves all saved analyses for a CV, newest first.
 *     tags:
 *       - CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CVId'
 *     responses:
 *       200:
 *         description: CV analysis history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CVAnalysisHistoryResponse'
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: CV not found.
 */

/**
 * @swagger
 * /api/v1/cvs/{cvId}:
 *   put:
 *     summary: Update a CV
 *     description: Replaces an uploaded CV file and deletes its previous analysis records.
 *     tags:
 *       - CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CVId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CVUploadRequest'
 *     responses:
 *       200:
 *         description: CV updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CVResponse'
 *       400:
 *         description: No replacement CV file was provided.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: CV not found.
 *
 *   delete:
 *     summary: Delete a CV
 *     description: Deletes the CV record and its physical file, if present.
 *     tags:
 *       - CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CVId'
 *     responses:
 *       200:
 *         description: CV deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CVDeleteResponse'
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: CV not found.
 */

/**
 * @swagger
 * /api/v1/cvs/{cvId}/download:
 *   get:
 *     summary: Download a CV
 *     description: Downloads the specified CV file belonging to the authenticated user.
 *     tags:
 *       - CV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CVId'
 *     responses:
 *       200:
 *         description: CV file returned for download.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: CV not found.
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