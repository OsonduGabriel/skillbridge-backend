const userSchema = {
  User: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Unique user identifier",
      },
      fullName: {
        type: "string",
        description: "User's full name",
        example: "John Doe",
      },
      email: {
        type: "string",
        format: "email",
        description: "User's email address",
        example: "john@example.com",
      },
      role: {
        type: "string",
        description: "User's assigned role",
        example: "user",
      },
      isVerified: {
        type: "boolean",
        description: "Whether the user's account has been verified",
        example: true,
      },
    },
  },

  UpdateUserRequest: {
    type: "object",
    properties: {
      fullName: {
        type: "string",
        description: "Updated full name",
        example: "John Doe",
      },
      email: {
        type: "string",
        format: "email",
        description: "Updated email address",
        example: "john@example.com",
      },
    },
    additionalProperties: false,
    minProperties: 1,
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

  CurrentUserResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Authenticated user retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          user: {
            $ref: "#/components/schemas/User",
          },
        },
      },
    },
  },

  AdminDashboardResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Welcome to the admin dashboard.",
      },
      data: {
        type: "object",
        properties: {
          user: {
            $ref: "#/components/schemas/User",
          },
        },
      },
    },
  },

  UserMessageResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "User deleted successfully",
      },
    },
  },
};

export default userSchema;