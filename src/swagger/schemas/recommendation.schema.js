
const recommendationSchema = {
  RecommendationSkill: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      name: {
        type: "string",
        example: "Express.js",
      },
      category: {
        type: "string",
        nullable: true,
        example: "Backend Development",
      },
    },
  },

  Recommendation: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      title: {
        type: "string",
        maxLength: 200,
        example: "Express.js Documentation",
      },
      description: {
        type: "string",
        example: "Learn how to build REST APIs using Express.js.",
      },
      type: {
        type: "string",
        enum: ["learning_resource", "project"],
        example: "learning_resource",
      },
      url: {
        type: "string",
        format: "uri",
        maxLength: 2048,
        nullable: true,
        example: "https://expressjs.com/",
      },
      skillId: {
        type: "integer",
        example: 1,
      },
      difficulty: {
        type: "string",
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
        example: "beginner",
      },
      estimatedHours: {
        type: "integer",
        minimum: 1,
        nullable: true,
        example: 5,
      },
      isActive: {
        type: "boolean",
        default: true,
        example: true,
      },
      skill: {
        $ref: "#/components/schemas/RecommendationSkill",
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
      "title",
      "description",
      "type",
      "skillId",
      "difficulty",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
  },

  PersonalizedRecommendation: {
    allOf: [
      {
        $ref: "#/components/schemas/Recommendation",
      },
      {
        type: "object",
        properties: {
          relevanceScore: {
            type: "number",
            example: 13,
            description: "Score calculated from the user's skills.",
          },
          careerGoal: {
            type: "string",
            nullable: true,
            example: "Become a Backend Developer",
          },
        },
        required: ["relevanceScore", "careerGoal"],
      },
    ],
  },

  RecommendationListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      count: {
        type: "integer",
        example: 5,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Recommendation",
        },
      },
    },
    required: ["success", "count", "data"],
  },

  PersonalizedRecommendationListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      count: {
        type: "integer",
        example: 5,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PersonalizedRecommendation",
        },
      },
    },
    required: ["success", "count", "data"],
  },

  RecommendationResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        $ref: "#/components/schemas/Recommendation",
      },
    },
    required: ["success", "data"],
  },
};

export default recommendationSchema;
