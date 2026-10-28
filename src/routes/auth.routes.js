/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User registration, login, and password recovery
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a student account. The password is hashed before storage, and the new account is initially unverified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Required registration fields are missing.
 *       500:
 *         description: Registration failed.
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in a user
 *     description: Authenticates a user and returns their profile and a JWT valid for seven days.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email or password is missing.
 *       500:
 *         description: Login failed.
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request a password reset code
 *     description: >
 *       Requests a six-digit password reset code. The code expires after
 *       ten minutes. The same success message is returned whether or not
 *       an account exists for the supplied email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset request processed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthMessageResponse'
 *       400:
 *         description: Email is missing.
 *       500:
 *         description: Password reset request failed.
 */

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify a password reset code
 *     description: Checks the reset code against the stored hash, expiry, and attempt limit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyResetCodeRequest'
 *     responses:
 *       200:
 *         description: Reset code verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthMessageResponse'
 *       400:
 *         description: Email or code is missing.
 *       500:
 *         description: Reset code verification failed.
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset a user's password
 *     description: >
 *       Resets the password when the supplied code is valid and has not
 *       expired. The new password must contain at least eight characters.
 *       A successful reset clears the stored reset code and resets the
 *       failed-attempt counter.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthMessageResponse'
 *       400:
 *         description: Required fields are missing or the new password is too short.
 *       500:
 *         description: Password reset failed.
 */


import express from "express";
import {register,login,forgotPassword,verifyResetCode,resetPassword,verifyEmail,} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
