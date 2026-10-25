
const userSchema = {
  User: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "550e8400-e29b-41d4-a716-446655440000",
      },

      fullName: {
        type: "string",
        example: "Gabriel Osondu",
      },

      email: {
        type: "string",
        format: "email",
        example: "gabriel@example.com",
      },

      role: {
        type: "string",
        enum: ["student", "mentor", "employer", "admin"],
        example: "student",
      },

      isVerified: {
        type: "boolean",
        example: false,
      },

      createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-10-25T10:30:00.000Z",
      },

      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2026-10-25T10:30:00.000Z",
      },
    },
  },

  CreateUser: {
    type: "object",
    required: ["fullName", "email", "password"],
    properties: {
      fullName: {
        type: "string",
        example: "Gabriel Osondu",
      },

      email: {
        type: "string",
        format: "email",
        example: "gabriel@example.com",
      },

      password: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "StrongPassword123!",
      },
    },
  },

  UpdateUser: {
    type: "object",
    properties: {
      fullName: {
        type: "string",
        example: "Gabriel Osondu",
      },

      email: {
        type: "string",
        format: "email",
        example: "gabriel@example.com",
      },
    },
  },

  UserResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },

      message: {
        type: "string",
        example: "User retrieved successfully",
      },

      data: {
        $ref: "#/components/schemas/User",
      },
    },
  },
};

export default userSchema;
