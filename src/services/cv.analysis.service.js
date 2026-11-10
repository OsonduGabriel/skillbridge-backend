
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

  // Extract text from PDF using the Cloudflare-compatible PDF.js bundle.
  if (fileType === "application/pdf" || extension === ".pdf") {
    const { getDocument } = await import("pdfjs-serverless");

    const loadingTask = getDocument({
      data: new Uint8Array(fileBuffer),
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const extractedPages = [];

    try {
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
        const page = await pdfDocument.getPage(pageNumber);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .filter((item) => "str" in item)
          .map((item) => item.str)
          .join(" ");

        extractedPages.push(pageText);
      }

      return extractedPages.join("\n");
    } finally {
      await loadingTask.destroy();
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

  // Step 1: Retrieve the uploaded CV from Cloudflare R2.
  console.log("[CV ANALYSIS] Starting R2 retrieval");

  const cvObject = await getCVFromR2(cv.filePath);

  if (!cvObject) {
    const error = new Error("CV file not found in R2 storage.");
    error.statusCode = 404;
    throw error;
  }

  console.log("[CV ANALYSIS] R2 retrieval completed");

  // Step 2: Convert the R2 object into a Node.js Buffer.
  const fileBuffer = Buffer.from(
    await cvObject.arrayBuffer()
  );

  console.log("[CV ANALYSIS] CV file downloaded", {
    fileSize: fileBuffer.length,
  });

  // Step 3: Extract text from the CV.
  console.log("[CV ANALYSIS] Starting PDF text extraction");

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

  console.log("[CV ANALYSIS] PDF text extraction completed", {
    textLength: extractedText.length,
  });

  // Step 4: Remove personally identifiable information.
  const sanitizedText = await sanitizeCVText(extractedText);

  console.log("[CV ANALYSIS] PII sanitization completed");

  // Step 5: Save the initial CV analysis record.
  console.log("[CV ANALYSIS] Saving initial analysis");

  const analysis = await saveExtractedText({
    cvId: cv.id,
    targetJobTitle,
    industryFocus,
    careerStage,
    primaryGoal,
    extractedText,
    sanitizedText,
  });

  console.log("[CV ANALYSIS] Initial analysis saved");

  // Step 6: Create a pending SkillGap record.
  console.log("[CV ANALYSIS] Creating SkillGap record");

  const skillGap = await createSkillGap(cv.userId, {
    cvId: cv.id,
    targetJobTitle,
    currentSkills: [],
    requiredSkills: [],
  });

  console.log("[CV ANALYSIS] SkillGap created");

  try {
    // Step 7: Send sanitized CV text to Gemini.
    console.log("[CV ANALYSIS] Starting Gemini request");

    const aiResponse = await analyzeCVWithAI({
      cvId: cv.id,
      sanitizedText,
      targetJobTitle,
      industryFocus,
      careerStage,
    });

    console.log("[CV ANALYSIS] Gemini request completed");

    const result = aiResponse.analysis;

    if (!result) {
      throw new Error("The AI service returned no analysis result.");
    }

    // Step 8: Save the AI analysis result.
    console.log("[CV ANALYSIS] Saving AI analysis result");

    const savedAnalysis = await saveAIAnalysisResult(
      analysis.id,
      result
    );

    if (!savedAnalysis) {
      throw new Error("Could not save the CV analysis result.");
    }

    console.log("[CV ANALYSIS] AI analysis result saved");

    // Step 9: Complete the SkillGap record.
    console.log("[CV ANALYSIS] Completing SkillGap analysis");

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

    console.log("[CV ANALYSIS] SkillGap analysis completed");

    // Return both saved records to the controller.
    return {
      analysis: savedAnalysis,
      skillGap: completedSkillGap,
      sanitizedText,
    };
  } catch (error) {
    console.error("[CV ANALYSIS] Processing failed:", {
      message: error.message,
      status: error.status,
    });

    // Mark the SkillGap record as failed if processing fails.
    try {
      await failSkillGapAnalysis(skillGap.id, cv.userId);
      console.log("[CV ANALYSIS] SkillGap marked as failed");
    } catch (statusError) {
      console.error(
        "[CV ANALYSIS] Could not update SkillGap failure status:",
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
