const authSchema = {
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
        example: "ExamplePassword123!",
      },
    },
    additionalProperties: false,
  },

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
        example: "ExamplePassword123!",
      },
    },
    additionalProperties: false,
  },

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
    additionalProperties: false,
  },

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
        pattern: "^\\d{6}$",
        example: "123456",
        description: "Six-digit password reset code.",
      },
    },
    additionalProperties: false,
  },

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
        pattern: "^\\d{6}$",
        example: "123456",
        description: "Six-digit password reset code.",
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "NewSecurePassword123!",
      },
    },
    additionalProperties: false,
  },

  AuthUser: {
    type: "object",
    required: ["id", "fullName", "email", "role", "isVerified"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
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
        example: "student",
      },
      isVerified: {
        type: "boolean",
        example: false,
      },
    },
  },

  RegisterResponse: {
    type: "object",
    required: ["success", "message", "data"],
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

  LoginResponse: {
    type: "object",
    required: ["success", "message", "data"],
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
        required: ["user", "token"],
        properties: {
          user: {
            $ref: "#/components/schemas/AuthUser",
          },
          token: {
            type: "string",
            description: "JWT access token valid for seven days.",
          },
        },
      },
    },
  },

  AuthMessageResponse: {
    type: "object",
    required: ["success", "message"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "If the account exists, a reset code will be sent.",
      },
    },
  },
};

export default authSchema;