const opportunitySchema = {
  Opportunity: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        readOnly: true,
      },
      title: {
        type: "string",
        maxLength: 200,
      },
      company: {
        type: "string",
        maxLength: 150,
      },
      description: {
        type: "string",
      },
      type: {
        type: "string",
        enum: [
          "internship",
          "job",
          "graduate_program",
          "fellowship",
          "freelance",
        ],
      },
      category: {
        type: "string",
        maxLength: 100,
        nullable: true,
      },
      location: {
        type: "string",
        maxLength: 150,
        nullable: true,
      },
      workMode: {
        type: "string",
        enum: ["remote", "hybrid", "onsite"],
        default: "onsite",
      },
      applicationUrl: {
        type: "string",
        format: "uri",
        maxLength: 500,
      },
      deadline: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      requiredSkills: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
      },
      preferredSkills: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
      },
      status: {
        type: "string",
        enum: ["active", "expired", "closed"],
        default: "active",
      },
      source: {
        type: "string",
        enum: ["manual", "aggregated"],
        default: "manual",
      },
      sourceName: {
        type: "string",
        maxLength: 100,
        nullable: true,
      },
      externalId: {
        type: "string",
        maxLength: 255,
        nullable: true,
      },
      lastSeenAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        readOnly: true,
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        readOnly: true,
      },
    },
    required: [
      "id",
      "title",
      "company",
      "description",
      "type",
      "workMode",
      "applicationUrl",
      "requiredSkills",
      "preferredSkills",
      "status",
      "source",
      "createdAt",
      "updatedAt",
    ],
  },

  CreateOpportunityRequest: {
    type: "object",
    required: [
      "title",
      "company",
      "description",
      "type",
      "applicationUrl",
    ],
    properties: {
      title: {
        type: "string",
        maxLength: 200,
      },
      company: {
        type: "string",
        maxLength: 150,
      },
      description: {
        type: "string",
      },
      type: {
        type: "string",
        enum: [
          "internship",
          "job",
          "graduate_program",
          "fellowship",
          "freelance",
        ],
      },
      category: {
        type: "string",
        maxLength: 100,
      },
      location: {
        type: "string",
        maxLength: 150,
      },
      workMode: {
        type: "string",
        enum: ["remote", "hybrid", "onsite"],
        default: "onsite",
      },
      applicationUrl: {
        type: "string",
        format: "uri",
        maxLength: 500,
      },
      deadline: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      requiredSkills: {
        type: "array",
        items: {
          type: "string",
        },
      },
      preferredSkills: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    additionalProperties: false,
  },

  UpdateOpportunityRequest: {
    type: "object",
    description:
      "Only supplied fields are updated. The source, sourceName, externalId, and lastSeenAt fields are not accepted by the update service.",
    minProperties: 1,
    properties: {
      title: {
        type: "string",
        maxLength: 200,
      },
      company: {
        type: "string",
        maxLength: 150,
      },
      description: {
        type: "string",
      },
      type: {
        type: "string",
        enum: [
          "internship",
          "job",
          "graduate_program",
          "fellowship",
          "freelance",
        ],
      },
      category: {
        type: "string",
        maxLength: 100,
        nullable: true,
      },
      location: {
        type: "string",
        maxLength: 150,
        nullable: true,
      },
      workMode: {
        type: "string",
        enum: ["remote", "hybrid", "onsite"],
      },
      applicationUrl: {
        type: "string",
        format: "uri",
        maxLength: 500,
      },
      deadline: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      requiredSkills: {
        type: "array",
        items: {
          type: "string",
        },
      },
      preferredSkills: {
        type: "array",
        items: {
          type: "string",
        },
      },
      status: {
        type: "string",
        enum: ["active", "expired", "closed"],
      },
    },
    additionalProperties: false,
  },

  OpportunityResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
      },
      data: {
        $ref: "#/components/schemas/Opportunity",
      },
    },
  },

  OpportunityListResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Opportunities retrieved successfully",
      },
      data: {
        type: "object",
        required: ["items", "pagination"],
        properties: {
          items: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Opportunity",
            },
          },
          pagination: {
            type: "object",
            required: ["page", "limit", "total", "totalPages"],
            properties: {
              page: {
                type: "integer",
              },
              limit: {
                type: "integer",
              },
              total: {
                type: "integer",
              },
              totalPages: {
                type: "integer",
              },
            },
          },
        },
      },
    },
  },

  OpportunityDeleteResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Opportunity deleted successfully",
      },
      data: {
        type: "object",
        nullable: true,
        example: null,
      },
    },
  },

  OpportunityAggregationSourceResult: {
    type: "object",
    required: ["sourceName", "processed"],
    properties: {
      sourceName: {
        type: "string",
        description: "Name of the opportunity source adapter.",
        example: "ExampleJobBoard",
      },
      processed: {
        type: "integer",
        minimum: 0,
        description:
          "Number of opportunity records processed successfully for this source.",
        example: 12,
      },
      error: {
        type: "string",
        description: "Error message when processing this source fails.",
        example: "Source request failed",
      },
    },
  },

  OpportunityAggregationResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Opportunity aggregation completed",
      },
      data: {
        type: "object",
        required: ["processed", "sources", "expired"],
        properties: {
          processed: {
            type: "integer",
            minimum: 0,
            description:
              "Total number of opportunity records processed successfully across all sources.",
            example: 20,
          },
          sources: {
            type: "array",
            items: {
              $ref: "#/components/schemas/OpportunityAggregationSourceResult",
            },
          },
          expired: {
            type: "integer",
            minimum: 0,
            description:
              "Number of stale opportunities marked as expired.",
            example: 3,
          },
        },
      },
    },
  },
};

export default opportunitySchema;
