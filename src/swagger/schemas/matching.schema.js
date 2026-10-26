const matchingSchema = {
  CareerMatch: {
    type: "object",
    required: [
      "id",
      "userId",
      "opportunityId",
      "matchPercentage",
      "matchedSkills",
      "missingSkills",
      "status",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Unique identifier of the career match.",
      },
      userId: {
        type: "string",
        format: "uuid",
        description: "ID of the user who owns the match.",
      },
      opportunityId: {
        type: "string",
        format: "uuid",
        description: "ID of the matched opportunity.",
      },
      matchPercentage: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description: "Calculated match score as a percentage.",
        example: 85,
      },
      matchedSkills: {
        type: "array",
        description: "User skills that match the opportunity's required or preferred skills.",
        items: {
          type: "string",
        },
        example: ["javascript", "node.js", "postgresql"],
      },
      missingSkills: {
        type: "array",
        description: "Required opportunity skills not found in the user's skills.",
        items: {
          type: "string",
        },
        example: ["docker", "redis"],
      },
      explanation: {
        type: "string",
        nullable: true,
        description: "Explanation of the calculated match.",
        example:
          "You match 3 of 4 required skills and 2 of 2 preferred skills. Skills to develop: docker.",
      },
      status: {
        type: "string",
        enum: ["pending", "completed", "failed"],
        description: "Processing status of the career match.",
        example: "completed",
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
  },

  CareerMatchWithOpportunity: {
    allOf: [
      {
        $ref: "#/components/schemas/CareerMatch",
      },
      {
        type: "object",
        required: ["opportunity"],
        properties: {
          opportunity: {
            $ref: "#/components/schemas/Opportunity",
          },
        },
      },
    ],
  },

  CareerMatchListResponse: {
    type: "object",
    required: ["success", "message", "count", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Career matches generated successfully.",
      },
      count: {
        type: "integer",
        minimum: 0,
        description: "Number of career matches returned.",
        example: 5,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/CareerMatchWithOpportunity",
        },
      },
    },
  },
};

export default matchingSchema;