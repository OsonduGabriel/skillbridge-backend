
/**
 * Extract text from CVs, sanitize personal information,
 * and save CV analysis results in the database.
 */
import path from "path";
import mammoth from "mammoth";
import { getCVFromR2 } from "./cv-storage.service.js";
import CVAnalysis from "../models/cv.analysis.model.js";
import sanitizePII from "../utils/pii.sanitizer.js";

import {
  createSkillGap,
  completeSkillGapAnalysis,
  failSkillGapAnalysis,
} from "./skillgap.service.js";

import { analyzeCVWithAI } from "./ai.service.js";

// Extract text from an uploaded CV.

const extractTextFromCV = async (fileBuffer, fileName, fileType) => {
  const extension = path.extname(fileName).toLowerCase();

  // Extract text from PDF.
  if (fileType === "application/pdf" || extension === ".pdf") {
    const { PDFParse } = await import("pdf-parse");

    const parser = new PDFParse({
      data: fileBuffer,
    });

    try {
      const pdfData = await parser.getText();
      return pdfData.text;
    } finally {
      await parser.destroy();
    }
  }

  // Extract text from DOCX.
  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === ".docx"
  ) {
    const result = await mammoth.extractRawText({
      buffer: fileBuffer,
    });

    return result.value;
  }

  // DOC extraction is not currently supported.
  if (fileType === "application/msword" || extension === ".doc") {
    throw new Error(
      "DOC files are accepted for upload, but text extraction is not supported yet."
    );
  }

  // Extract plain text.
  if (fileType === "text/plain" || extension === ".txt") {
    return fileBuffer.toString("utf-8");
  }

  throw new Error("Unsupported CV file type.");
};


// Remove personally identifiable information from extracted CV text.
const sanitizeCVText = (extractedText) => {
  return sanitizePII(extractedText);
};

// Save the extracted and sanitized text in the database.
const saveExtractedText = async ({
  cvId,
  targetJobTitle,
  industryFocus,
  careerStage,
  primaryGoal,
  extractedText,
  sanitizedText,
}) => {
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

// Get the latest analysis for a particular CV.
const getCVAnalysis = async (cvId) => {
  const analysis = await CVAnalysis.findOne({
    where: { cvId },
    order: [["createdAt", "DESC"]],
  });

  return analysis;
};

// Get the complete analysis history for a particular CV.
const getCVAnalysisHistory = async (cvId) => {
  const analyses = await CVAnalysis.findAll({
    where: { cvId },
    order: [["createdAt", "DESC"]],
  });

  return analyses;
};

// Save the AI analysis result in the database.
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

// Process a CV and save its analysis and SkillGap records.
const processCVAnalysis = async ({
  cv,
  targetJobTitle,
  industryFocus,
  careerStage,
  primaryGoal,
}) => {
  // Currently, only Gap Analysis is supported.
  if (primaryGoal !== "Gap Analysis") {
    const error = new Error(
      "AI analysis is currently available for Gap Analysis only."
    );

    error.statusCode = 501;
    throw error;
  }

  // Retrieve the uploaded CV from Cloudflare R2.
  const cvObject = await getCVFromR2(cv.filePath);

  if (!cvObject) {
    const error = new Error("CV file not found in R2 storage.");
    error.statusCode = 404;
    throw error;
  }

  // Convert the R2 object into a Node.js Buffer.
  const fileBuffer = Buffer.from(
    await cvObject.arrayBuffer()
  );

  // Extract the CV text.
  const extractedText = await extractTextFromCV(
    fileBuffer,
    cv.fileName,
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
  const skillGap = await createSkillGap(cv.userId, {
    cvId: cv.id,
    targetJobTitle,
    currentSkills: [],
    requiredSkills: [],
  });

  try {
    // Step 5: Send sanitized CV text to the AI service.
    const aiResponse = await analyzeCVWithAI({
      cvId: cv.id,
      sanitizedText,
      targetJobTitle,
      industryFocus,
      careerStage,
    });

    const result = aiResponse.analysis;

    if (!result) {
      throw new Error("The AI service returned no analysis result.");
    }

    // Step 6: Save the AI analysis result.
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

    // Return both saved records to the controller.
    return {
      analysis: savedAnalysis,
      skillGap: completedSkillGap,
      sanitizedText,
    };
  } catch (error) {
    // Mark the SkillGap record as failed if processing fails.
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

export {
  extractTextFromCV,
  saveExtractedText,
  getCVAnalysis,
  sanitizeCVText,
  saveAIAnalysisResult,
  processCVAnalysis,
  getCVAnalysisHistory,
};
