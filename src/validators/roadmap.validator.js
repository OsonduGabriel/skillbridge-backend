import { body, param } from "express-validator";
import { ROADMAP_STATUSES } from "../models/roadmap.model.js";
import {
  ROADMAP_PHASES,
  ROADMAP_TASK_STATUSES,
  ROADMAP_TASK_TYPES,
} from "../models/roadmap-task.model.js";

const nonEmptyUpdate = body().custom((value) => {
  if (!value || Object.keys(value).length === 0) {
    throw new Error("Provide at least one field to update");
  }
  return true;
});

export const roadmapIdRules = [
  param("id").isUUID().withMessage("Invalid roadmap id"),
];

export const generateRoadmapRules = [
  body("skillGapId").isUUID().withMessage("A valid skillGapId is required"),
];

export const updateRoadmapRules = [
  ...roadmapIdRules,
  nonEmptyUpdate,
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("targetRole").optional().trim().notEmpty().isLength({ max: 200 }),
  body("summary").optional().trim().notEmpty(),
  body("status").optional().isIn(ROADMAP_STATUSES),
  body("startDate").optional().isISO8601(),
];

export const createRoadmapTaskRules = [
  ...roadmapIdRules,
  body("phase")
    .isInt()
    .toInt()
    .custom((phase) => ROADMAP_PHASES.includes(phase)),
  body("position").optional().isInt({ min: 0 }).toInt(),
  body("title").trim().notEmpty().isLength({ max: 200 }),
  body("description").trim().notEmpty(),
  body("taskType").isIn(ROADMAP_TASK_TYPES),
  body("skill")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .isLowercase(),
  body("recommendationId").optional({ nullable: true }).isUUID(),
  body("resourceUrl").optional({ nullable: true }).isURL().isLength({ max: 500 }),
  body("estimatedHours").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("dueDate").optional({ nullable: true }).isISO8601(),
  body("status").optional().isIn(ROADMAP_TASK_STATUSES),
];

export const roadmapTaskIdRules = [
  ...roadmapIdRules,
  param("taskId").isUUID().withMessage("Invalid task id"),
];

export const updateRoadmapTaskRules = [
  ...roadmapTaskIdRules,
  nonEmptyUpdate,
  body("phase")
    .optional()
    .isInt()
    .toInt()
    .custom((phase) => ROADMAP_PHASES.includes(phase)),
  body("position").optional().isInt({ min: 0 }).toInt(),
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("description").optional().trim().notEmpty(),
  body("taskType").optional().isIn(ROADMAP_TASK_TYPES),
  body("skill")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .isLowercase(),
  body("recommendationId").optional({ nullable: true }).isUUID(),
  body("resourceUrl").optional({ nullable: true }).isURL().isLength({ max: 500 }),
  body("estimatedHours").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("dueDate").optional({ nullable: true }).isISO8601(),
  body("status").optional().isIn(ROADMAP_TASK_STATUSES),
];
