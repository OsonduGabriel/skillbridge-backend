import CV from "../models/cv.model.js";
import validateCVAnalysisInput from "../validators/cv.analysis.validator.js";
import { extractTextFromCV, saveExtractedText, sanitizeCVText, getCVAnalysis } from "../services/cv.analysis.service.js";

const analyzeCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;

    const {
      targetJobTitle,
      industryFocus,
      careerStage,
      primaryGoal,
    } = req.body;

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

    const cv = await CV.findByPk(cvId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    const extractedText = await extractTextFromCV(
      cv.filePath,
      cv.fileType
    );

    const sanitizedText = sanitizeCVText(extractedText);

    const analysis = await saveExtractedText({
          cvId: cv.id,
          targetJobTitle,
          industryFocus,
          careerStage,
          primaryGoal,
          extractedText,
          sanitizedText,
      });

    return res.status(201).json({
      success: true,
      message: "CV processed successfully.",
      data: {
        analysisId: analysis.id,
        targetJobTitle,
        industryFocus,
        careerStage,
        primaryGoal,
        extractedText,
        sanitizedText,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysis = async (req, res, next) => {
  try {
    const { cvId } = req.params;

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

export { analyzeCV,  getAnalysis };