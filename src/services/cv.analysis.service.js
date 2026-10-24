//*Extract text from CV using cv analysis and save in database

import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import CVAnalysis from "../models/cv.analysis.model.js";
import sanitizePII from "../utils/pii.sanitizer.js";
import { analyzeCVWithAI } from "./ai.service.js";

//function: extract text from cv
const extractTextFromCV = async (filePath, fileType) => {
  const extension = path.extname(filePath).toLowerCase();

  //cv in pdf format
 if (fileType === "application/pdf" || extension === ".pdf") {
  const fileBuffer = await fs.readFile(filePath);

  const parser = new PDFParse({ data: fileBuffer });

  try {
    const pdfData = await parser.getText();
    return pdfData.text;
  } finally {
    await parser.destroy();
  }
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
const processCVAnalysis = async ({ cv, targetJobTitle, industryFocus, careerStage, primaryGoal}) => {
  // The current AI integration supports Skill Gap Analysis only.
  // Do not return a skill-gap result for a different goal.
  if (primaryGoal !== "Gap Analysis") {
    const error = new Error(
      "AI analysis is currently available for Gap Analysis only.");
    error.statusCode = 501;
    throw error;
  }

  // Step 1: Extract text from the uploaded CV.
  const extractedText = await extractTextFromCV(
    cv.filePath,
    cv.fileType
  );

  // Reject files that contain no extractable text.
  if (!extractedText || !extractedText.trim()) {
    const error = new Error(
      "No readable text was found in the CV.");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Remove confidential information.
  const sanitizedText = await sanitizeCVText(extractedText);

  // Step 3: Save the CV text and analysis details.
  const analysis = await saveExtractedText({
    cvId: cv.id,
    targetJobTitle,
    industryFocus,
    careerStage,
    primaryGoal,
    extractedText,
    sanitizedText,
  });

  // Step 4: Send the sanitized CV text to the AI service.
  const aiResponse = await analyzeCVWithAI({
    cvId: cv.id,
    sanitizedText,
    targetJobTitle,
    industryFocus,
    careerStage,
  });

  // Step 5: Save the AI result to the same analysis record.
  const savedAnalysis = await saveAIAnalysisResult(
    analysis.id,
    aiResponse.analysis
  );

  if (!savedAnalysis) {
    throw new Error("Could not save the AI analysis result.");
  }

  // Return the saved record and sanitized text to the controller.
  return {
    analysis: savedAnalysis,
    sanitizedText,
  };
};

export { extractTextFromCV, saveExtractedText, getCVAnalysis, sanitizeCVText, saveAIAnalysisResult, processCVAnalysis, getCVAnalysisHistory };
