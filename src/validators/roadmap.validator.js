
import { body, param } from "express-validator";
import { ROADMAP_STATUSES } from "../models/roadmap.model.js";
import {
  ROADMAP_PHASES,
  ROADMAP_TASK_STATUSES,
  ROADMAP_TASK_TYPES,
} from "../models/roadmap-task.model.js";

// Ensure update requests contain at least one valid field
// and reject properties that the service does not support.
const validateUpdateBody = (allowedFields) =>
  body().custom((value) => {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.keys(value).length === 0
    ) {
      throw new Error("Provide at least one field to update");
    }

    const unknownFields = Object.keys(value).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      throw new Error(
        `Unsupported update field(s): ${unknownFields.join(", ")}`
      );
    }

    return true;
  });

// Validate roadmap ID
export const roadmapIdRules = [
  param("id").isUUID().withMessage("Invalid roadmap id"),
];

// Validate roadmap generation request
export const generateRoadmapRules = [
  body("skillGapId")
    .isUUID()
    .withMessage("A valid skillGapId is required"),
];

// Validate roadmap updates
export const updateRoadmapRules = [
  ...roadmapIdRules,

  validateUpdateBody([
    "title",
    "targetRole",
    "summary",
    "status",
    "startDate",
  ]),

  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("targetRole").optional().trim().notEmpty().isLength({ max: 200 }),
  body("summary").optional().trim().notEmpty(),
  body("status").optional().isIn(ROADMAP_STATUSES),
  body("startDate").optional().isISO8601(),
];

// Validate task creation
export const createRoadmapTaskRules = [
  ...roadmapIdRules,

  body("phase")
    .isInt()
    .toInt()
    .custom((phase) => ROADMAP_PHASES.includes(phase))
    .withMessage("Invalid roadmap phase"),

  body("position").optional().isInt({ min: 0 }).toInt(),

  body("title").trim().notEmpty().isLength({ max: 200 }),

  body("description").trim().notEmpty(),

  body("taskType").isIn(ROADMAP_TASK_TYPES),

  body("skill")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .isLength({ max: 100 }),

  body("recommendationId")
    .optional({ nullable: true })
    .isUUID(),

  body("resourceUrl")
    .optional({ nullable: true })
    .isURL()
    .isLength({ max: 500 }),

  body("estimatedHours")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .toFloat(),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601(),

  body("status").optional().isIn(ROADMAP_TASK_STATUSES),
];

// Validate both roadmap ID and task ID
export const roadmapTaskIdRules = [
  ...roadmapIdRules,
  param("taskId").isUUID().withMessage("Invalid task id"),
];

// Validate task updates
export const updateRoadmapTaskRules = [
  ...roadmapTaskIdRules,

  validateUpdateBody([
    "phase",
    "position",
    "title",
    "description",
    "taskType",
    "skill",
    "recommendationId",
    "resourceUrl",
    "estimatedHours",
    "dueDate",
    "status",
  ]),

  body("phase")
    .optional()
    .isInt()
    .toInt()
    .custom((phase) => ROADMAP_PHASES.includes(phase))
    .withMessage("Invalid roadmap phase"),

  body("position").optional().isInt({ min: 0 }).toInt(),

  body("title").optional().trim().notEmpty().isLength({ max: 200 }),

  body("description").optional().trim().notEmpty(),

  body("taskType").optional().isIn(ROADMAP_TASK_TYPES),

  body("skill")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .isLength({ max: 100 }),

  body("recommendationId")
    .optional({ nullable: true })
    .isUUID(),

  body("resourceUrl")
    .optional({ nullable: true })
    .isURL()
    .isLength({ max: 500 }),

  body("estimatedHours")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .toFloat(),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601(),

  body("status").optional().isIn(ROADMAP_TASK_STATUSES),
];
