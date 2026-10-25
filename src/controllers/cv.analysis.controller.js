import CV from "../models/cv.model.js";
import validateCVAnalysisInput from "../validators/cv.analysis.validator.js";
import { processCVAnalysis, getCVAnalysis, getCVAnalysisHistory } from "../services/cv.analysis.service.js";


//*We are not calling AI service yet and we use cvId which will change after getting Taiwo's authentication codes

// Find a CV only if it belongs to the logged-in user.
// Return null if the CV does not exist or belongs to someone else.
const findUserCV = async (cvId, userId) => {
  return CV.findOne({
    where: {
      id: cvId,
      userId,
    },
  });
};



//Extracts and sanitizes a CV, then saves an analysis record
const analyzeCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;

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
    // Verify that this CV belongs to the logged-in user.
    const cv = await findUserCV(cvId, userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    // Extract CV text, sanitize PII, and save the analysis
    const { analysis, skillGap } = await processCVAnalysis({
  cv,
  targetJobTitle,
  industryFocus,
  careerStage,
  primaryGoal,
});

    return res.status(201).json({
    success: true,
    message: "CV skill-gap analysis completed successfully.",
    data: {
    analysisId: analysis.id,
    skillGapId: skillGap.id,
    targetJobTitle: analysis.targetJobTitle,
    industryFocus: analysis.industryFocus,
    careerStage: analysis.careerStage,
    primaryGoal: analysis.primaryGoal,
    analysisResult: analysis.analysisResult,
    skillGap,
  },
});
  } catch (error) {
    next(error);
  }
};

//function: get Analysis for a cv
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
//retrieve user cv
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
    const userId = req.user.id;

    // Check ownership before retrieving the history.
    const cv = await findUserCV(cvId, userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }
//retrieve cv history
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