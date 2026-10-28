
import {
  generateCareerMatches,
  getUserCareerMatches,
} from "../services/matching.service.js";

// Generate career matches for the logged-in user.
const generateMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const matches = await generateCareerMatches(userId);

    return res.status(200).json({
      success: true,
      message: "Career matches generated successfully.",
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve saved career matches for the logged-in user.
const getMyMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const matches = await getUserCareerMatches(userId);

    return res.status(200).json({
      success: true,
      message: "Career matches retrieved successfully.",
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

export { generateMatches, getMyMatches };
