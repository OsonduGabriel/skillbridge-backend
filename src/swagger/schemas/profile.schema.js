
/**
 * Swagger schemas for Profile endpoints.
 */
const profileSwaggerSchema = {
  Profile: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        readOnly: true,
      },
      userId: {
        type: "string",
        format: "uuid",
        description: "ID of the user who owns this profile.",
      },
      bio: {
        type: "string",
        nullable: true,
      },
      phone: {
        type: "string",
        nullable: true,
      },
      location: {
        type: "string",
        nullable: true,
      },
      profileImage: {
        type: "string",
        nullable: true,
        description: "Profile image URL or stored image reference.",
      },
      education: {
        type: "string",
        nullable: true,
      },
      experience: {
        type: "string",
        nullable: true,
      },
      careerGoal: {
        type: "string",
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
  },

  UpdateProfileRequest: {
    type: "object",
    description: "Fields that can be supplied when creating or updating a profile. All fields are optional; at least one should be provided.",
    properties: {
      bio: {
        type: "string",
        nullable: true,
      },
      phone: {
        type: "string",
        nullable: true,
      },
      location: {
        type: "string",
        nullable: true,
      },
      profileImage: {
        type: "string",
        nullable: true,
      },
      education: {
        type: "string",
        nullable: true,
      },
      experience: {
        type: "string",
        nullable: true,
      },
      careerGoal: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
    minProperties: 1,
  },

  ProfileUser: {
    type: "object",
    description: "Authenticated user's account details, excluding the password, with the associated profile when present.",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      fullName: {
        type: "string",
      },
      email: {
        type: "string",
        format: "email",
      },
      role: {
        type: "string",
      },
      isVerified: {
        type: "boolean",
      },
      profile: {
        allOf: [
          {
            $ref: "#/components/schemas/Profile",
          },
        ],
        nullable: true,
      },
    },
    additionalProperties: true,
  },

  ProfileResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Profile updated successfully",
      },
      data: {
        $ref: "#/components/schemas/Profile",
      },
    },
  },

  ProfileUserResponse: {
    type: "object",
    required: ["success", "message", "data"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Profile retrieved successfully",
      },
      data: {
        $ref: "#/components/schemas/ProfileUser",
      },
    },
  },
};

export default profileSwaggerSchema;
