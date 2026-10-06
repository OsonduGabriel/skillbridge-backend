import CV from "../models/cv.model.js";
import { extractTextFromCV, saveExtractedText, getCVAnalysis } from "../services/cv.analysis.service.js";

const analyzeCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;

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

    const analysis = await saveExtractedText(
      cv.id,
      extractedText
    );

    return res.status(200).json({
      success: true,
      message: "CV text extracted successfully.",
      data: analysis,
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