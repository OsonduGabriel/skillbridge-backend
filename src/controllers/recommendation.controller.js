
import {
  getRecommendations,
  getRecommendationById,
  getPersonalizedRecommendations,
} from "../services/recommendation.service.js";

const validTypes = ["learning_resource", "project"];
const validDifficulties = ["beginner", "intermediate", "advanced"];

export const listRecommendations = async (req, res, next) => {
  try {
    const { type, skillId, difficulty } = req.query;

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recommendation type.",
      });
    }

    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty level.",
      });
    }

    let parsedSkillId;

    if (skillId !== undefined) {
      parsedSkillId = Number(skillId);

      if (!Number.isSafeInteger(parsedSkillId) || parsedSkillId < 1) {
        return res.status(400).json({
          success: false,
          message: "skillId must be a positive integer.",
        });
      }
    }

    const recommendations = await getRecommendations({
      type,
      skillId: parsedSkillId,
      difficulty,
    });

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendation = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Recommendation ID must be a positive integer.",
      });
    }

    const recommendation = await getRecommendationById(id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    next(error);
  }
};

export const getPersonalized = async (req, res, next) => {
  try {
    const recommendations = await getPersonalizedRecommendations(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};
