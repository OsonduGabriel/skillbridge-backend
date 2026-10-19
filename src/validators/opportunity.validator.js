import { body, param, query } from "express-validator";
import {
  OPPORTUNITY_TYPES,
  WORK_MODES,
  OPPORTUNITY_STATUSES,
} from "../models/opportunity.model.js";

export const createOpportunityRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 }),
  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company is required")
    .isLength({ max: 150 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("type")
    .isIn(OPPORTUNITY_TYPES)
    .withMessage(`Type must be one of: ${OPPORTUNITY_TYPES.join(", ")}`),
  body("category").optional().trim().isLength({ max: 100 }),
  body("location").optional().trim().isLength({ max: 150 }),
  body("workMode").optional().isIn(WORK_MODES),
  body("applicationUrl")
    .isURL()
    .withMessage("A valid application URL is required"),
  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be an ISO date"),
  body("requiredSkills").optional().isArray(),
  body("requiredSkills.*").isString().trim().notEmpty(),
  body("preferredSkills").optional().isArray(),
  body("preferredSkills.*").isString().trim().notEmpty(),
];

export const listOpportunityRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  query("type").optional().isIn(OPPORTUNITY_TYPES),
  query("workMode").optional().isIn(WORK_MODES),
  query("status").optional().isIn(OPPORTUNITY_STATUSES),
  query("skill").optional().trim().notEmpty(),
];

export const opportunityIdRules = [
  param("id").isUUID().withMessage("Invalid opportunity id"),
];

export const updateOpportunityRules = [
  ...opportunityIdRules,
  body().custom((value) => {
    if (!value || Object.keys(value).length === 0)
      throw new Error("Provide at least one field to update");
    return true;
  }),
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("company").optional().trim().notEmpty().isLength({ max: 150 }),
  body("description").optional().trim().notEmpty(),
  body("type").optional().isIn(OPPORTUNITY_TYPES),
  body("category").optional().trim().isLength({ max: 100 }),
  body("location").optional().trim().isLength({ max: 150 }),
  body("workMode").optional().isIn(WORK_MODES),
  body("applicationUrl").optional().isURL(),
  body("deadline").optional({ nullable: true }).isISO8601(),
  body("status").optional().isIn(OPPORTUNITY_STATUSES),
  body("requiredSkills").optional().isArray(),
  body("requiredSkills.*").isString().trim().notEmpty(),
  body("preferredSkills").optional().isArray(),
  body("preferredSkills.*").isString().trim().notEmpty(),
];
