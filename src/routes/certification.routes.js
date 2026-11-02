import express from "express";

import {
    getCertifications,
    issueCertificate,
    getMyCertificates,
    getCertificateById,
    verifyCertificate,
} from "../controllers/certification.controller.js";

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