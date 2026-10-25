/**
 * OPPORTUNITY ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/opportunities
 * All routes require authentication.
 * Creating, updating, deleting, and aggregating opportunities require admin access.
 *
 * @swagger
 * tags:
 *   name: Opportunities
 *   description: Manage, retrieve, and aggregate career opportunities
 */

/**
 * @swagger
 * /api/v1/opportunities/aggregate:
 *   post:
 *     summary: Aggregate career opportunities
 *     description: Collect and aggregate opportunities. Admin access is required.
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Opportunities aggregated successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       500:
 *         description: Failed to aggregate opportunities.
 */

/**
 * @swagger
 * /api/v1/opportunities:
 *   get:
 *     summary: List career opportunities
 *     description: Retrieve a list of opportunities using supported filters or pagination.
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Opportunities retrieved successfully.
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Failed to retrieve opportunities.
 *
 *   post:
 *     summary: Create a career opportunity
 *     description: Create a new opportunity. Admin access is required.
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Opportunity details required by the application.
 *     responses:
 *       201:
 *         description: Opportunity created successfully.
 *       400:
 *         description: Invalid opportunity data.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *
 * /api/v1/opportunities/{id}:
 *   get:
 *     summary: Get an opportunity by ID
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the opportunity.
 *     responses:
 *       200:
 *         description: Opportunity retrieved successfully.
 *       400:
 *         description: Invalid opportunity ID.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Opportunity not found.
 *
 *   patch:
 *     summary: Update an opportunity
 *     description: Update an existing opportunity. Admin access is required.
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the opportunity to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Opportunity fields to update.
 *     responses:
 *       200:
 *         description: Opportunity updated successfully.
 *       400:
 *         description: Invalid opportunity ID or update data.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Opportunity not found.
 *
 *   delete:
 *     summary: Delete an opportunity
 *     description: Delete an existing opportunity. Admin access is required.
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the opportunity to delete.
 *     responses:
 *       200:
 *         description: Opportunity deleted successfully.
 *       400:
 *         description: Invalid opportunity ID.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Opportunity not found.
 */

import { Router } from "express";
import * as controller from "../controllers/opportunity.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createOpportunityRules,
  listOpportunityRules,
  opportunityIdRules,
  updateOpportunityRules,
} from "../validators/opportunity.validator.js";

const router = Router();

router.post(
  "/aggregate",
  protect,
  authorize("admin"),
  controller.aggregateOpportunities,
);

router.get(
  "/",
  protect,
  listOpportunityRules,
  validate,
  controller.listOpportunities,
);
router.get(
  "/:id",
  protect,
  opportunityIdRules,
  validate,
  controller.getOpportunity,
);
router.post(
  "/",
  protect,
  authorize("admin"),
  createOpportunityRules,
  validate,
  controller.createOpportunity,
);
router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateOpportunityRules,
  validate,
  controller.updateOpportunity,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  opportunityIdRules,
  validate,
  controller.deleteOpportunity,
);

export default router;
