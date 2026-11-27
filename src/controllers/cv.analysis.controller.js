
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

// Process a CV based on the selected analysis goal.
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

    // Verify that the CV belongs to the logged-in user.
    const cv = await findUserCV(cvId, userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    // Process the CV according to the selected primary goal.
    const result = await processCVAnalysis({
      cv,
      targetJobTitle,
      industryFocus,
      careerStage,
      primaryGoal,
    });

    const { analysis, skillGap, roadmap } = result;

    // Return the appropriate response for the selected goal.
    const messages = {
      "CV Review": "CV review completed successfully.",
      "Gap Analysis": "CV skill-gap analysis completed successfully.",
      Roadmap: "Career roadmap generated successfully.",
    };

    return res.status(201).json({
      success: true,
      message: messages[primaryGoal] || "CV analysis completed successfully.",
      data: {
        analysisId: analysis.id,
        skillGapId: skillGap?.id || null,
        targetJobTitle: analysis.targetJobTitle,
        industryFocus: analysis.industryFocus,
        careerStage: analysis.careerStage,
        primaryGoal: analysis.primaryGoal,
        analysisResult: analysis.analysisResult,
        skillGap: skillGap || null,
        roadmap: roadmap || null,
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

    // Check ownership before retrieving the analysis.
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

// Retrieve the analysis history for a CV.
const getAnalysisHistory = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;

    // Check ownership before retrieving the history.
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

export {
  analyzeCV,
  getAnalysis,
  getAnalysisHistory,
};
