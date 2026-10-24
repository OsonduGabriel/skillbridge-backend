//*Extract text from CV using cv analysis and save in database 

import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import CVAnalysis from "../models/cv.analysis.model.js";
import sanitizePII from "../utils/pii.sanitizer.js";
import {
  createSkillGap, completeSkillGapAnalysis, failSkillGapAnalysis} from "./skillgap.service.js";

//function: extract text from cv
const extractTextFromCV = async (filePath, fileType) => {
  const extension = path.extname(filePath).toLowerCase();

  //cv in pdf format
  if (fileType === "application/pdf" || extension === ".pdf") {
    const fileBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(fileBuffer);

    return pdfData.text;
  }

    //cv in word docx format
  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || extension === ".docx") {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value;
  }

    //cv in word doc format
  if (fileType === "application/msword" || extension === ".doc") {
    throw new Error("DOC files are currently accepted for upload, but text extraction is not supported yet.");
  }

    //cv in text format
  if (fileType === "text/plain" || extension === ".txt") {
  const text = await fs.readFile(filePath, "utf-8");

  return text;
}

  throw new Error("Unsupported CV file type.");
};

//function: sanitize cv text - remove user confidential information form cv
const sanitizeCVText = (extractedText) => {
  return sanitizePII(extractedText);
};

//function: save extracted text
const saveExtractedText = async ({cvId, targetJobTitle, industryFocus, careerStage, primaryGoal,
  extractedText, sanitizedText}) => {

  const analysis = await CVAnalysis.create({
    cvId,
    targetJobTitle,
    industryFocus,
    careerStage,
    primaryGoal,
    extractedText,
    sanitizedText,
  });

  return analysis;
};

//function: get cv analysis for a particular cv uploaded by the user
const getCVAnalysis = async (cvId) => {
  const analysis = await CVAnalysis.findOne({
    where: { cvId },
    order: [["createdAt", "DESC"]]
  });

  return analysis;
};

//function: get cv analysis history for a particular cv - to preserve every cv analysis that was done on a particular cv for a user
const getCVAnalysisHistory = async(cvId) => {
  const analyses = await CVAnalysis.findAll({
    where: {cvId},
    order: [["createdAt", "DESC"]]
  })

  return analyses
}

//function: save ai analysis result from ai team
const saveAIAnalysisResult = async (analysisId, analysisResult) => {
  const analysis = await CVAnalysis.findByPk(analysisId);

  if (!analysis) {
    return null;
  }

  await analysis.update({
    analysisResult,
  });

  return analysis;
};

//function: process a cv and save extracted text and sanitized extracted ext

const processCVAnalysis = async ({
  cv,
  targetJobTitle,
  industryFocus,
  careerStage,
  primaryGoal,
}) => {
  // This AI integration currently supports Gap Analysis only.
  if (primaryGoal !== "Gap Analysis") {
    const error = new Error(
      "AI analysis is currently available for Gap Analysis only."
    );
    error.statusCode = 501;
    throw error;
  }

  // Step 1: Extract text from the uploaded CV.
  const extractedText = await extractTextFromCV(
    cv.filePath,
    cv.fileType
  );

  if (!extractedText || !extractedText.trim()) {
    const error = new Error("No readable text was found in the CV.");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Remove personally identifiable information.
  const sanitizedText = await sanitizeCVText(extractedText);

  // Step 3: Save the initial CV analysis record.
  const analysis = await saveExtractedText({
    cvId: cv.id,
    targetJobTitle,
    industryFocus,
    careerStage,
    primaryGoal,
    extractedText,
    sanitizedText,
  });

  // Step 4: Create a pending SkillGap record.
  // cv.userId identifies the owner of this uploaded CV.
  const skillGap = await createSkillGap(cv.userId, {
    cvId: cv.id,
    targetJobTitle,
    currentSkills: [],
    requiredSkills: [],
  });

  try {
    // Step 5: Send sanitized text to Gemini.
    const aiResponse = await analyzeCVWithAI({
      cvId: cv.id,
      sanitizedText,
      targetJobTitle,
      industryFocus,
      careerStage,
    });

    const result = aiResponse.analysis;

    // Step 6: Save the full AI result in CVAnalysis.
    const savedAnalysis = await saveAIAnalysisResult(
      analysis.id,
      result
    );

    if (!savedAnalysis) {
      throw new Error("Could not save the CV analysis result.");
    }

    // Step 7: Complete the SkillGap record using the AI result.
    const completedSkillGap = await completeSkillGapAnalysis(
      skillGap.id,
      cv.userId,
      {
        currentSkills: result.identified_skills,
        requiredSkills: [],
        missingSkills: result.skill_gaps,
        analysisResult: result,
      }
    );

    if (!completedSkillGap) {
      throw new Error("Could not save the SkillGap analysis result.");
    }

    // Return both records to the controller.
    return {
      analysis: savedAnalysis,
      skillGap: completedSkillGap,
      sanitizedText,
    };
  } catch (error) {
    // Record the failed status if AI processing or result saving fails.
    try {
      await failSkillGapAnalysis(skillGap.id, cv.userId);
    } catch (statusError) {
      console.error(
        "Could not update SkillGap failure status:",
        statusError.message
      );
    }

    throw error;
  }
};


