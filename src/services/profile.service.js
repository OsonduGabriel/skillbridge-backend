
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";

// Get the authenticated user's profile and basic user details.
export const getProfileByUserId = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password"],
    },
    include: [
      {
        model: Profile,
        as: "profile",
        required: false,
      },
    ],
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Create a profile if one doesn't exist,
// or update the existing profile.
export const updateProfile = async (userId, data) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Only allow fields that belong to the Profile model.
  const allowedFields = [
    // Existing profile fields
    "bio",
    "phone",
    "location",
    "profileImage",
    "education",
    "experience",
    "careerGoal",

    // New career survey fields
    "targetJobTitle",
    "industryFocus",
    "careerStage",
    "primaryGoal",
    "payMin",
    "payMax",
    "workMode",
  ];

  const profileData = {};

  // Copy only permitted fields from the request.
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      profileData[field] = data[field];
    }
  }

  // Find the user's profile or create one.
  const [profile, created] = await Profile.findOrCreate({
    where: {
      userId,
    },
    defaults: {
      userId,
      ...profileData,
    },
  });

  // Update the existing profile when it already exists.
  if (!created) {
    await profile.update(profileData);
  }

  return profile;
};

// Preserve the existing service export used by the controller.
export const upsertMyProfile = async (userId, profileData) => {
  return updateProfile(userId, profileData);
};
