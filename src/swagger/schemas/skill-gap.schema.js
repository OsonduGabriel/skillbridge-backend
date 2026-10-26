const skillGapSchema = {
  SkillGap: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "550e8400-e29b-41d4-a716-446655440000",
      },
      userId: {
        type: "string",
        format: "uuid",
        example: "660e8400-e29b-41d4-a716-446655440000",
      },
      cvId: {
        type: "string",
        format: "uuid",
        nullable: true,
        example: "770e8400-e29b-41d4-a716-446655440000",
      },
      targetJobTitle: {
        type: "string",
        example: "backend developer",
      },
      currentSkills: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["javascript", "node.js", "express"],
      },
      requiredSkills: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["javascript", "node.js", "postgresql", "redis"],
      },
      missingSkills: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["postgresql", "redis"],
      },
      analysisResult: {
        type: "object",
        nullable: true,
        additionalProperties: true,
        description: "Skill-gap analysis result. The exact structure depends on the analysis implementation.",
        example: {
          summary: "Additional database skills are needed for the target role.",
        },
      },
      status: {
        type: "string",
        enum: ["pending", "completed", "failed"],
        example: "pending",
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

  CreateSkillGapRequest: {
    type: "object",
    required: ["targetJobTitle"],
    properties: {
      cvId: {
        type: "string",
        format: "uuid",
        nullable: true,
        description: "Optional ID of a CV belonging to the authenticated user.",
      },
      targetJobTitle: {
        type: "string",
        example: "backend developer",
      },
      currentSkills: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["javascript", "node.js", "express"],
      },
      requiredSkills: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["javascript", "node.js", "postgresql"],
      },
    },
  },

  UpdateSkillGapRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      cvId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      targetJobTitle: {
        type: "string",
        example: "full-stack developer",
      },
      currentSkills: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["javascript", "react", "node.js"],
      },
      requiredSkills: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["javascript", "react", "node.js", "postgresql"],
      },
    },
    description: "All fields are optional. Updating an accepted field resets the analysis to pending.",
  },

  SkillGapResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Skill-gap analysis retrieved successfully.",
      },
      data: {
        $ref: "#/components/schemas/SkillGap",
      },
    },
  },

  SkillGapListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Skill-gap analyses retrieved successfully.",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SkillGap",
        },
      },
    },
  },

  SkillGapDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Skill-gap analysis deleted successfully.",
      },
    },
  },
};

export default skillGapSchema;