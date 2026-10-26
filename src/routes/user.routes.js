/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User account management and administration
 *
 * /api/v1/users/me:
 *   get:
 *     summary: Get my user profile
 *     description: Retrieves the authenticated user's account information.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *
 *   put:
 *     summary: Update my user account
 *     description: Updates the authenticated user's account information using fields accepted by the user service.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Delete my user account
 *     description: Deletes the authenticated user's account.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMessageResponse'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *
 * /api/v1/users/current:
 *   get:
 *     summary: Get the current authenticated user
 *     description: Retrieves the user information attached to the authenticated request.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CurrentUserResponse'
 *       401:
 *         description: Authentication required
 *
 * /api/v1/users/admin:
 *   get:
 *     summary: Get the admin dashboard
 *     description: Retrieves dashboard information for an authenticated user with the admin role.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminDashboardResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied. Admin role required
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