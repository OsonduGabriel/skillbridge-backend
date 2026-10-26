
const roadmapSchema = {
  Roadmap: {
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
      skillGapId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      title: {
        type: "string",
        maxLength: 200,
        example: "Backend Developer Learning Roadmap",
      },
      targetRole: {
        type: "string",
        maxLength: 200,
        example: "Backend Developer",
      },
      summary: {
        type: "string",
        example: "A structured plan for developing backend skills.",
      },
      status: {
        type: "string",
        enum: ["draft", "active", "completed", "archived"],
        default: "draft",
      },
      generatedBy: {
        type: "string",
        enum: ["ai", "manual"],
        default: "manual",
      },
      startDate: {
        type: "string",
        format: "date-time",
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
      "title",
      "targetRole",
      "summary",
      "status",
      "generatedBy",
      "startDate",
    ],
  },

  RoadmapTask: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      roadmapId: {
        type: "string",
        format: "uuid",
      },
      phase: {
        type: "integer",
        enum: [30, 60, 90],
        description: "Learning phase in days.",
        example: 30,
      },
      position: {
        type: "integer",
        default: 0,
        description: "Task position within its phase.",
        example: 1,
      },
      title: {
        type: "string",
        maxLength: 200,
        example: "Learn Express.js fundamentals",
      },
      description: {
        type: "string",
        example: "Study routing, middleware, and error handling.",
      },
      taskType: {
        type: "string",
        enum: ["learn", "project", "practice", "apply"],
      },
      skill: {
        type: "string",
        maxLength: 100,
        nullable: true,
        description: "Skill name must be lowercase.",
        example: "express",
      },
      recommendationId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      resourceUrl: {
        type: "string",
        maxLength: 500,
        nullable: true,
        example: "https://expressjs.com/",
      },
      estimatedHours: {
        type: "number",
        format: "float",
        nullable: true,
        example: 5,
      },
      dueDate: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      status: {
        type: "string",
        enum: ["todo", "in_progress", "done"],
        default: "todo",
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
      "roadmapId",
      "phase",
      "position",
      "title",
      "description",
      "taskType",
      "status",
    ],
  },

  GenerateRoadmapRequest: {
    type: "object",
    required: ["skillGapId"],
    properties: {
      skillGapId: {
        type: "string",
        format: "uuid",
        description:
          "ID of the skill-gap analysis used to generate the roadmap.",
      },
    },
    additionalProperties: false,
  },

  UpdateRoadmapRequest: {
    type: "object",
    properties: {
      title: {
        type: "string",
        maxLength: 200,
      },
      targetRole: {
        type: "string",
        maxLength: 200,
      },
      summary: {
        type: "string",
      },
      status: {
        type: "string",
        enum: ["draft", "active", "completed", "archived"],
      },
      startDate: {
        type: "string",
        format: "date-time",
      },
    },
    minProperties: 1,
    additionalProperties: false,
  },

  CreateRoadmapTaskRequest: {
    type: "object",
    required: ["phase", "title", "description", "taskType"],
    properties: {
      phase: {
        type: "integer",
        enum: [30, 60, 90],
        example: 30,
      },
      position: {
        type: "integer",
        example: 1,
      },
      title: {
        type: "string",
        maxLength: 200,
        example: "Learn Express.js fundamentals",
      },
      description: {
        type: "string",
      },
      taskType: {
        type: "string",
        enum: ["learn", "project", "practice", "apply"],
      },
      skill: {
        type: "string",
        maxLength: 100,
        description: "Skill name must be lowercase.",
        example: "express",
      },
      recommendationId: {
        type: "string",
        format: "uuid",
      },
      resourceUrl: {
        type: "string",
        maxLength: 500,
      },
      estimatedHours: {
        type: "number",
        format: "float",
        example: 5,
      },
      dueDate: {
        type: "string",
        format: "date-time",
      },
      status: {
        type: "string",
        enum: ["todo", "in_progress", "done"],
      },
    },
    additionalProperties: false,
  },

  UpdateRoadmapTaskRequest: {
    type: "object",
    properties: {
      phase: {
        type: "integer",
        enum: [30, 60, 90],
      },
      position: {
        type: "integer",
      },
      title: {
        type: "string",
        maxLength: 200,
      },
      description: {
        type: "string",
      },
      taskType: {
        type: "string",
        enum: ["learn", "project", "practice", "apply"],
      },
      skill: {
        type: "string",
        maxLength: 100,
      },
      recommendationId: {
        type: "string",
        format: "uuid",
      },
      resourceUrl: {
        type: "string",
        maxLength: 500,
      },
      estimatedHours: {
        type: "number",
        format: "float",
      },
      dueDate: {
        type: "string",
        format: "date-time",
      },
      status: {
        type: "string",
        enum: ["todo", "in_progress", "done"],
      },
    },
    minProperties: 1,
    additionalProperties: false,
  },

  RoadmapResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Roadmap retrieved successfully",
      },
      data: {
        $ref: "#/components/schemas/Roadmap",
      },
    },
  },

  RoadmapListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Roadmaps retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Roadmap",
            },
          },
        },
        required: ["items"],
      },
    },
  },

  RoadmapWithTasksResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Roadmap retrieved successfully",
      },
      data: {
        allOf: [
          {
            $ref: "#/components/schemas/Roadmap",
          },
          {
            type: "object",
            properties: {
              tasksByPhase: {
                type: "object",
                required: ["30", "60", "90"],
                properties: {
                  "30": {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/RoadmapTask",
                    },
                  },
                  "60": {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/RoadmapTask",
                    },
                  },
                  "90": {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/RoadmapTask",
                    },
                  },
                },
              },
            },
            required: ["tasksByPhase"],
          },
        ],
      },
    },
  },

  RoadmapDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Roadmap deleted successfully",
      },
      data: {
        type: "object",
        nullable: true,
        example: null,
      },
    },
  },

  RoadmapTaskDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Roadmap task deleted successfully",
      },
      data: {
        type: "object",
        nullable: true,
        example: null,
      },
    },
  },
};

export default roadmapSchema;
