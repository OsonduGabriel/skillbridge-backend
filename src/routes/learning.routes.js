/**
 * @swagger
 * /api/v1/learning/courses:
 *   get:
 *     summary: Get published learning courses
 *     tags: [Learning]
 *     responses:
 *       200:
 *         description: Published courses retrieved successfully
 *       500:
 *         description: Failed to retrieve courses
 */
/**
 * @swagger
 * /api/v1/learning/courses/{id}:
 *   get:
 *     summary: Get course details with modules and lessons
 *     tags: [Learning]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *       400:
 *         description: Invalid course ID
 *       404:
 *         description: Course not found
 *       500:
 *         description: Failed to retrieve course
 */
/**
 * @swagger
 * /api/v1/learning/enrollments:
 *   post:
 *     summary: Enrol the authenticated user in a course
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollCourseRequest'
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *       400:
 *         description: Course ID is required
 *       404:
 *         description: Course not found or unavailable
 *       409:
 *         description: Already enrolled in course
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to enrol in course
 */
/**
 * @swagger
 * /api/v1/learning/my-courses:
 *   get:
 *     summary: Get courses enrolled by the authenticated user
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrolled courses retrieved successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve enrolled courses
 */
/**
 * @swagger
 * /api/v1/learning/lessons/{id}/complete:
 *   patch:
 *     summary: Mark a lesson as completed
 *     tags: [Learning]
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
 *         description: Lesson completed successfully
 *       400:
 *         description: Invalid lesson ID
 *       403:
 *         description: Enrollment required or lesson tracking unavailable
 *       404:
 *         description: Lesson not found
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to complete lesson
 */
/**
 * @swagger
 * /api/v1/learning/progress:
 *   get:
 *     summary: Get authenticated user's learning progress
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Learning progress retrieved successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to retrieve learning progress
 */

import express from "express";
import { getCourses, getCourseById, enrollInCourse, getMyCourses, completeLesson, getLearningProgress, } from "../controllers/learning.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all published courses
router.get("/courses", getCourses);

// Get course details, including modules and lessons
router.get("/courses/:id", getCourseById);

// Enroll authenticated user in a course
router.post("/enrollments", protect, enrollInCourse);

// Get courses enrolled by the authenticated user
router.get("/my-courses", protect, getMyCourses);

// Mark a lesson as completed
router.patch("/lessons/:id/complete", protect, completeLesson);

// Get overall learning progress for the authenticated user
router.get("/progress", protect, getLearningProgress);

export default router;