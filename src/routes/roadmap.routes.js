import { Router } from "express";
import * as controller from "../controllers/roadmap.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createRoadmapTaskRules,
  generateRoadmapRules,
  roadmapIdRules,
  roadmapTaskIdRules,
  updateRoadmapRules,
  updateRoadmapTaskRules,
} from "../validators/roadmap.validator.js";

const router = Router();

router.use(protect);

router.post("/generate", generateRoadmapRules, validate, controller.generateRoadmap);
router.get("/", controller.listRoadmaps);
router.get("/:id", roadmapIdRules, validate, controller.getRoadmap);
router.patch(
  "/:id",
  updateRoadmapRules,
  validate,
  controller.updateRoadmap,
);
router.delete("/:id", roadmapIdRules, validate, controller.deleteRoadmap);
router.post(
  "/:id/tasks",
  createRoadmapTaskRules,
  validate,
  controller.createRoadmapTask,
);
router.patch(
  "/:id/tasks/:taskId",
  updateRoadmapTaskRules,
  validate,
  controller.updateRoadmapTask,
);
router.delete(
  "/:id/tasks/:taskId",
  roadmapTaskIdRules,
  validate,
  controller.deleteRoadmapTask,
);

export default router;
