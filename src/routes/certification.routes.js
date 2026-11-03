/**
 * @swagger
 * /api/v1/certifications:
 *   get:
 *     summary: Get available certifications
 *     tags: [Certifications]
 *     responses:
 *       200:
 *         description: Certifications retrieved successfully
 *       500:
 *         description: Failed to retrieve certifications
 */
/**
 * @swagger
 * /api/v1/certifications/issue:
 *   post:
 *     summary: Issue a certificate after course completion
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IssueCertificateRequest'
 *     responses:
 *       201:
 *         description: Certificate issued successfully
 *       200:
 *         description: Certificate already issued
 *       400:
 *         description: Invalid course ID
 *       403:
 *         description: Course is external or completion requirement not met
 *       404:
 *         description: Course, enrollment, or certification not found
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to issue certificate
 */
/**
 * @swagger
 * /api/v1/certifications/my-certificates:
 *   get:
 *     summary: Get certificates belonging to the authenticated user
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User certificates retrieved successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve certificates
 */
/**
 * @swagger
 * /api/v1/certifications/verify/{code}:
 *   get:
 *     summary: Verify a certificate using its verification code
 *     tags: [Certifications]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^SB-[A-F0-9]{32}$'
 *         example: SB-0123456789ABCDEF0123456789ABCDEF
 *     responses:
 *       200:
 *         description: Certificate verified successfully
 *       400:
 *         description: Invalid certificate code
 *       404:
 *         description: Certificate not found
 *       500:
 *         description: Certificate verification failed
 */
/**
 * @swagger
 * /api/v1/certifications/{id}:
 *   get:
 *     summary: Get a certificate by ID
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Certificate retrieved successfully
 *       400:
 *         description: Invalid certificate ID
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve certificate
 */

import express from "express";
import { getCertifications, issueCertificate, getMyCertificates, getCertificateById, verifyCertificate, } from "../controllers/certification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: List available certifications
router.get("/", getCertifications);

// Protected: Issue a certificate
router.post("/issue", protect, issueCertificate);

// Protected: Get logged-in user's certificates
router.get("/my-certificates", protect, getMyCertificates);

// Public: Verify a certificate
router.get("/verify/:code", verifyCertificate);

// Protected: Get certificate details
router.get("/:id", protect, getCertificateById);

export default router;