
import CV from "../models/cv.model.js";
import validateCVAnalysisInput from "../validators/cv.analysis.validator.js";
import {
  processCVAnalysis,
  getCVAnalysis,
  getCVAnalysisHistory,
} from "../services/cv.analysis.service.js";

// Find a CV only if it belongs to the logged-in user.
const findUserCV = async (cvId, userId) => {
  return CV.findOne({
    where: {
      id: cvId,
      userId,
    },
  });
};

// Extract and sanitize a CV, then save the AI analysis.
const analyzeCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;

    const {
      targetJobTitle,
      industryFocus,
      careerStage,
      primaryGoal,
    } = req.body;

    // Validate the analysis input.
    const errors = validateCVAnalysisInput({
      targetJobTitle,
      industryFocus,
      careerStage,
      primaryGoal,
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis input.",
        errors,
      });
    }

    // Confirm that the CV belongs to the logged-in user.
    const cv = await findUserCV(cvId, userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    // Extract text, sanitize it, call AI, and save the result.
    const { analysis, sanitizedText } = await processCVAnalysis({
      cv,
      targetJobTitle,
      industryFocus,
      careerStage,
      primaryGoal,
    });

    return res.status(201).json({
      success: true,
      message: "CV analysis completed successfully.",
      data: {
        analysisId: analysis.id,
        targetJobTitle: analysis.targetJobTitle,
        industryFocus: analysis.industryFocus,
        careerStage: analysis.careerStage,
        primaryGoal: analysis.primaryGoal,
        analysisResult: analysis.analysisResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve the latest analysis for a CV.
const getAnalysis = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;

    // Check CV ownership before retrieving its analysis.
    const cv = await findUserCV(cvId, userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    const analysis = await getCVAnalysis(cvId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "CV analysis not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "CV analysis retrieved successfully.",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve the history of all analyses for a CV.
const getAnalysisHistory = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;

    // Check CV ownership before retrieving the history.
    const cv = await findUserCV(cvId, userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    const analyses = await getCVAnalysisHistory(cvId);

    return res.status(200).json({
      success: true,
      message: "CV analysis history retrieved successfully.",
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};

export { analyzeCV, getAnalysis, getAnalysisHistory };
