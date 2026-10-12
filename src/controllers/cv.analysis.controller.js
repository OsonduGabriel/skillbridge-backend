import CV from "../models/cv.model.js";
import validateCVAnalysisInput from "../validators/cv.analysis.validator.js";
import { processCVAnalysis, getCVAnalysis, getCVAnalysisHistory } from "../services/cv.analysis.service.js";


//*We are not calling AI service yet and we use cvId which will change after getting Taiwo's authentication codes
//Extracts and sanitizes a CV, then saves an analysis record
const analyzeCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;

    const {targetJobTitle, industryFocus, careerStage,primaryGoal} = req.body;
//validate the analysis input
    const errors = validateCVAnalysisInput({targetJobTitle,industryFocus,careerStage,primaryGoal});

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis input.",
        errors,
      });
    }

    //find the uploaded cv
    const cv = await CV.findByPk(cvId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    // Extract CV text, sanitize PII, and save the analysis
    const {analysis, sanitizedText} = await processCVAnalysis({
          cv,
          targetJobTitle,
          industryFocus,
          careerStage,
          primaryGoal
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
        sanitizedText,
      },
    });
  } catch (error) {
    next(error);
  }
};

//get Analysis for a cv
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

//get history of all analysis done for a cv
const getAnalysisHistory = async(req, res, next) => {
  try {
    const {cvId} = req.params

    const analyses = await getCVAnalysisHistory(cvId)
    return res.status(200).json({
      success: true,
      message: "CV analysis history retrieved successfully.",
      data: analyses
    })
  } catch (error) {
    next(error)
  }
}
export { analyzeCV,  getAnalysis, getAnalysisHistory };