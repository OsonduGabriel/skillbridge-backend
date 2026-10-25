
const authSchema = {
  // User registration request
  RegisterRequest: {
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

  // User login request
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "gabriel@example.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "StrongPassword123!",
      },
    },
  },

  // Forgot password request
  ForgotPasswordRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "gabriel@example.com",
      },
    },
  },

  // Verify reset code request
  VerifyResetCodeRequest: {
    type: "object",
    required: ["email", "code"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "gabriel@example.com",
      },
      code: {
        type: "string",
        example: "123456",
      },
    },
  },

  // Reset password request
  ResetPasswordRequest: {
    type: "object",
    required: ["email", "code", "newPassword"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "gabriel@example.com",
      },
      code: {
        type: "string",
        example: "123456",
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "NewStrongPassword123!",
      },
    },
  },

  // Public user details returned by authentication
  AuthUser: {
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
    },
  },

  // Registration response
  RegisterResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Registration successful",
      },
      data: {
        $ref: "#/components/schemas/AuthUser",
      },
    },
  },

  // Login response
  LoginResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Login successful",
      },
      data: {
        type: "object",
        properties: {
          user: {
            $ref: "#/components/schemas/AuthUser",
          },
          token: {
            type: "string",
            description: "JWT access token. Expires in 7 days.",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    },
  },

  // Standard message response
  ApiMessageResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Operation completed successfully",
      },
    },
  },
};

export default authSchema;
