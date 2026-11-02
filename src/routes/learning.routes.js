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