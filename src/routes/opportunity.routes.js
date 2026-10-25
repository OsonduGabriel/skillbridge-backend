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
