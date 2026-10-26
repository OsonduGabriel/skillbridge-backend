
const cvSchema = {
  CVUploadRequest: {
    type: "object",
    required: ["cv"],
    properties: {
      cv: {
        type: "string",
        format: "binary",
        description: "CV file to upload.",
      },
    },
  },

  CVAnalysisRequest: {
    type: "object",
    required: ["careerStage", "primaryGoal"],
    properties: {
      targetJobTitle: {
        type: "string",
        description: "Optional target job title.",
        example: "Backend Developer",
      },
      industryFocus: {
        type: "string",
        description: "Optional industry focus.",
        example: "Software Engineering",
      },
      careerStage: {
        type: "string",
        enum: ["Student", "Entry", "Mid", "Senior", "Pivot"],
        minLength: 1,
        example: "Entry",
      },
      primaryGoal: {
        type: "string",
        enum: ["CV Review", "Gap Analysis", "Roadmap"],
        minLength: 1,
        example: "Gap Analysis",
        description:
          "Accepted values are CV Review, Gap Analysis, and Roadmap. Currently, only Gap Analysis is supported by the CV analysis service.",
      },
    },
    additionalProperties: false,
  },

  CV: {
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
      fileName: {
        type: "string",
        example: "my-cv.pdf",
      },
      fileType: {
        type: "string",
        example: "application/pdf",
      },
      fileSize: {
        type: "integer",
        description: "File size in bytes.",
        example: 245760,
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

  CVResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "CV uploaded successfully.",
      },
      data: {
        $ref: "#/components/schemas/CV",
      },
    },
  },

  CVListResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "CVs retrieved successfully.",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/CV",
        },
      },
    },
  },

  CVDeleteResponse: {
    type: "object",
    required: ["success", "message"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "CV deleted successfully.",
      },
    },
  },

  CVAnalysis: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      cvId: {
        type: "string",
        format: "uuid",
      },
      targetJobTitle: {
        type: "string",
        nullable: true,
      },
      industryFocus: {
        type: "string",
        nullable: true,
      },
      careerStage: {
        type: "string",
        enum: ["Student", "Entry", "Mid", "Senior", "Pivot"],
      },
      primaryGoal: {
        type: "string",
        enum: ["CV Review", "Gap Analysis", "Roadmap"],
      },
      extractedText: {
        type: "string",
        description: "Text extracted from the uploaded CV.",
      },
      sanitizedText: {
        type: "string",
        nullable: true,
        description:
          "Extracted CV text after personally identifiable information is sanitized.",
      },
      analysisResult: {
        type: "object",
        nullable: true,
        additionalProperties: true,
        description:
          "Saved AI analysis result. Its structure depends on the AI response.",
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

  CVSkillGap: {
    type: "object",
    description: "Skill-gap record returned by the SkillGap service.",
    additionalProperties: true,
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      cvId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      targetJobTitle: {
        type: "string",
      },
      currentSkills: {
        type: "array",
        items: {
          type: "string",
        },
      },
      requiredSkills: {
        type: "array",
        items: {
          type: "string",
        },
      },
      missingSkills: {
        type: "array",
        items: {
          type: "string",
        },
      },
      status: {
        type: "string",
        enum: ["pending", "completed", "failed"],
      },
    },
  },

  CVAnalysisCreatedData: {
    type: "object",
    required: [
      "analysisId",
      "skillGapId",
      "targetJobTitle",
      "industryFocus",
      "careerStage",
      "primaryGoal",
      "analysisResult",
      "skillGap",
    ],
    properties: {
      analysisId: {
        type: "string",
        format: "uuid",
      },
      skillGapId: {
        type: "string",
        format: "uuid",
      },
      targetJobTitle: {
        type: "string",
        nullable: true,
      },
      industryFocus: {
        type: "string",
        nullable: true,
      },
      careerStage: {
        type: "string",
        enum: ["Student", "Entry", "Mid", "Senior", "Pivot"],
      },
      primaryGoal: {
        type: "string",
        enum: ["CV Review", "Gap Analysis", "Roadmap"],
      },
      analysisResult: {
        type: "object",
        nullable: true,
        additionalProperties: true,
      },
      skillGap: {
        $ref: "#/components/schemas/CVSkillGap",
      },
    },
  },

  CVAnalysisCreatedResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "CV skill-gap analysis completed successfully.",
      },
      data: {
        $ref: "#/components/schemas/CVAnalysisCreatedData",
      },
    },
  },

  CVAnalysisResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "CV analysis retrieved successfully.",
      },
      data: {
        $ref: "#/components/schemas/CVAnalysis",
      },
    },
  },

  CVAnalysisHistoryResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "CV analysis history retrieved successfully.",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/CVAnalysis",
        },
      },
    },
  },
};

export default cvSchema;
