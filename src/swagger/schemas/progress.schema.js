
const progressSchema = {
  Progress: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      userId: {
        type: "string",
        format: "uuid",
      },
      recommendationId: {
        type: "integer",
        example: 1,
      },
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "completed"],
        example: "in_progress",
      },
      progressPercentage: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        example: 50,
      },
      startedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      completedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
    required: [
      "id",
      "userId",
      "recommendationId",
      "status",
      "progressPercentage",
      "createdAt",
      "updatedAt",
    ],
  },

  ProgressRecommendation: {
    allOf: [
      {
        $ref: "#/components/schemas/Recommendation",
      },
    ],
    description: "Recommendation associated with the progress record.",
  },

  ProgressWithRecommendation: {
    allOf: [
      {
        $ref: "#/components/schemas/Progress",
      },
      {
        type: "object",
        properties: {
          recommendation: {
            $ref: "#/components/schemas/Recommendation",
          },
        },
      },
    ],
  },

  CreateProgressRequest: {
    type: "object",
    required: ["recommendationId"],
    properties: {
      recommendationId: {
        type: "integer",
        minimum: 1,
        example: 1,
        description: "Positive integer ID of the recommendation to track.",
      },
    },
    additionalProperties: false,
  },

  UpdateProgressRequest: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "completed"],
        example: "in_progress",
      },
      progressPercentage: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        example: 50,
      },
    },
    minProperties: 1,
    additionalProperties: false,
    description:
      "Provide status, progressPercentage, or both. Completed items must have progressPercentage set to 100 when that field is supplied.",
  },

  ProgressResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Progress updated successfully.",
      },
      data: {
        $ref: "#/components/schemas/ProgressWithRecommendation",
      },
    },
    required: ["success", "data"],
  },

  ProgressListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      count: {
        type: "integer",
        example: 3,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ProgressWithRecommendation",
        },
      },
    },
    required: ["success", "count", "data"],
  },

  ProgressDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Progress tracking removed.",
      },
    },
    required: ["success", "message"],
  },
};

export default progressSchema;
