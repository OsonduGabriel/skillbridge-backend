/**
 * OPPORTUNITY ROUTES DOCUMENTATION
 *
 * Base path: /api/v1/opportunities
 *
 * All routes require JWT authentication.
 * Creating, updating, deleting, and aggregating opportunities require admin access.
 *
 * @swagger
 * tags:
 *   - name: Opportunities
 *     description: Manage, retrieve, and aggregate career opportunities
 */

/**
 * @swagger
 * /api/v1/opportunities/aggregate:
 *   post:
 *     summary: Aggregate career opportunities
 *     description: Run the opportunity aggregation service. Admin access is required.
 *     tags:
 *       - Opportunities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Opportunity aggregation completed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityAggregationResponse'
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
 *     description: Retrieve opportunities using optional search, skill, category, location, type, work mode, status, and pagination filters.
 *     tags:
 *       - Opportunities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of results per page.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search opportunity titles and company names.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [internship, job, graduate_program, fellowship, freelance]
 *         description: Filter by opportunity type.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category.
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location.
 *       - in: query
 *         name: workMode
 *         schema:
 *           type: string
 *           enum: [remote, hybrid, onsite]
 *         description: Filter by work mode.
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter by a required or preferred skill.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, closed]
 *           default: active
 *         description: Filter by opportunity status.
 *     responses:
 *       200:
 *         description: Opportunities retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityListResponse'
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Authentication required.
 *
 *   post:
 *     summary: Create a career opportunity
 *     description: Create a new manually entered opportunity. Admin access is required.
 *     tags:
 *       - Opportunities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOpportunityRequest'
 *     responses:
 *       201:
 *         description: Opportunity created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityResponse'
 *       400:
 *         description: Invalid opportunity data.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 */

/**
 * @swagger
 * /api/v1/opportunities/{id}:
 *   get:
 *     summary: Get an opportunity by ID
 *     description: Retrieve a single opportunity by its UUID.
 *     tags:
 *       - Opportunities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the opportunity.
 *     responses:
 *       200:
 *         description: Opportunity retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityResponse'
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Opportunity not found.
 *
 *   patch:
 *     summary: Update an opportunity
 *     description: Update an existing opportunity. Admin access is required.
 *     tags:
 *       - Opportunities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the opportunity to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOpportunityRequest'
 *     responses:
 *       200:
 *         description: Opportunity updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityResponse'
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
 *     description: Permanently delete an opportunity. Admin access is required.
 *     tags:
 *       - Opportunities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the opportunity to delete.
 *     responses:
 *       200:
 *         description: Opportunity deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityDeleteResponse'
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
