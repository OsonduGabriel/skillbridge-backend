import * as opportunityService from "../services/opportunity.service.js";
import { runOpportunityAggregation } from "../services/opportunityAggregation.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const createOpportunity = async (req, res) => {
  const opportunity = await opportunityService.createOpportunity(req.body);
  return successResponse(
    res,
    201,
    "Opportunity created successfully",
    opportunity,
  );
};

export const listOpportunities = async (req, res) => {
  const result = await opportunityService.listOpportunities({
    ...req.query,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  });
  return successResponse(
    res,
    200,
    "Opportunities retrieved successfully",
    result,
  );
};

export const getOpportunity = async (req, res) => {
  const opportunity = await opportunityService.getOpportunityById(
    req.params.id,
  );
  if (!opportunity) return errorResponse(res, 404, "Opportunity not found");
  return successResponse(
    res,
    200,
    "Opportunity retrieved successfully",
    opportunity,
  );
};

export const updateOpportunity = async (req, res) => {
  const opportunity = await opportunityService.updateOpportunity(
    req.params.id,
    req.body,
  );
  return successResponse(
    res,
    200,
    "Opportunity updated successfully",
    opportunity,
  );
};

export const deleteOpportunity = async (req, res) => {
  await opportunityService.deleteOpportunity(req.params.id);
  return successResponse(res, 200, "Opportunity deleted successfully", null);
};

export const aggregateOpportunities = async (req, res) => {
  const result = await runOpportunityAggregation();
  return successResponse(
    res,
    200,
    "Opportunity aggregation completed",
    result,
  );
};
