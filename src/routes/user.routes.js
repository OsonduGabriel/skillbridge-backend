/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User account management and administration
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get my user profile
 *     description: Retrieves the authenticated user's account information.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *
 *   put:
 *     summary: Update my user account
 *     description: Updates the authenticated user's account information.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: User fields accepted for updating, as defined by the controller.
 *     responses:
 *       200:
 *         description: User account updated successfully.
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *
 *   delete:
 *     summary: Delete my user account
 *     description: Deletes the authenticated user's account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully.
 *       204:
 *         description: User account deleted successfully with no response body.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/users/current:
 *   get:
 *     summary: Get the current authenticated user
 *     description: Retrieves information about the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/users/admin:
 *   get:
 *     summary: Get the admin dashboard
 *     description: Retrieves dashboard information for users with the admin role.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Access denied. Admin role required.
 *       500:
 *         description: Internal server error.
 */

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