const skillSchema = {
  Skill: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Unique catalogue skill identifier",
      },
      name: {
        type: "string",
        example: "JavaScript",
      },
      description: {
        type: "string",
        nullable: true,
        example: "Programming language used for web development",
      },
      category: {
        type: "string",
        nullable: true,
        example: "Programming",
      },
      isActive: {
        type: "boolean",
        description: "Whether the skill is available in the catalogue",
        example: true,
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

  UserSkill: {
    type: "object",
    properties: {
      skillId: {
        type: "string",
        format: "uuid",
        description: "ID of the associated catalogue skill",
      },
      name: {
        type: "string",
        example: "JavaScript",
      },
      description: {
        type: "string",
        nullable: true,
        example: "Programming language used for web development",
      },
      category: {
        type: "string",
        nullable: true,
        example: "Programming",
      },
      proficiencyLevel: {
        type: "string",
        description: "User's proficiency level for this skill",
        example: "intermediate",
      },
      addedAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  CreateSkillRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        example: "JavaScript",
      },
      description: {
        type: "string",
        example: "Programming language used for web development",
      },
      category: {
        type: "string",
        example: "Programming",
      },
    },
  },

  UpdateSkillRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
        example: "JavaScript",
      },
      description: {
        type: "string",
        example: "Programming language used for web development",
      },
      category: {
        type: "string",
        example: "Programming",
      },
      isActive: {
        type: "boolean",
        example: true,
      },
    },
    minProperties: 1,
  },

  AddUserSkillRequest: {
    type: "object",
    required: ["skillId", "proficiencyLevel"],
    properties: {
      skillId: {
        type: "string",
        format: "uuid",
        description: "ID of an active skill in the catalogue",
      },
      proficiencyLevel: {
        type: "string",
        example: "intermediate",
      },
    },
  },

  UpdateUserSkillRequest: {
    type: "object",
    required: ["proficiencyLevel"],
    properties: {
      proficiencyLevel: {
        type: "string",
        example: "advanced",
      },
    },
  },

  SkillListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Skills retrieved successfully",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Skill",
        },
      },
    },
  },

  UserSkillListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "User skills retrieved successfully",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/UserSkill",
        },
      },
    },
  },
};

export default skillSchema;