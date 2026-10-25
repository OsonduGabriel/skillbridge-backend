
import {getProfileByUserId,updateProfile,upsertMyProfile as upsertMyProfileService,} from "../services/profile.service.js";
import { profileSchema } from "../validators/profile.validator.js"; 


export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getProfileByUserId(req.user.id);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await updateProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/users/me/profile
export const upsertMyProfile = async (req, res) => {
  try {
    const validation = profileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Use the authenticated user's ID from the JWT.
     const profile = await upsertMyProfileService(
      req.user.id,
      validation.data
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully.",
      data: {
        profile,
      },
    });
  } catch (error) {
    console.error("Save profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to save profile.",
    });
  }
};
