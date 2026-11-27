
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

import {
  analyzeCVWithAI,
  reviewCVWithAI,
} from "./ai.service.js";

import { generateRoadmap } from "./roadmap.service.js";

// =====================================================
// 1. SKILL NORMALIZATION
// =====================================================

const SKILL_ALIASES = {
  express: "expressjs",
  expressjs: "expressjs",
  react: "reactjs",
  reactjs: "reactjs",
  node: "nodejs",
  nodejs: "nodejs",
  postgres: "postgresql",
  postgresql: "postgresql",
  js: "javascript",
  javascript: "javascript",
  html5: "html",
  html: "html",
  css3: "css",
  css: "css",
};

const CANONICAL_SKILL_LABELS = {
  expressjs: "Express.js",
  reactjs: "React.js",
  nodejs: "Node.js",
  postgresql: "PostgreSQL",
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
};

const getSkillKey = (skill) => {
  if (typeof skill !== "string") {
    return "";
  }

  const normalized = skill
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");

  return SKILL_ALIASES[normalized] || normalized;
};

const normalizeSkillNames = (skills = []) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  const uniqueSkills = new Map();

  for (const skill of skills) {
    if (typeof skill !== "string" || !skill.trim()) {
      continue;
    }

    const trimmedSkill = skill.trim();
    const canonicalKey = getSkillKey(trimmedSkill);

    if (!canonicalKey) {
      continue;
    }

    const displayName =
      CANONICAL_SKILL_LABELS[canonicalKey] || trimmedSkill;

    if (!uniqueSkills.has(canonicalKey)) {
      uniqueSkills.set(canonicalKey, displayName);
    }
  }

  return Array.from(uniqueSkills.values());
};

const calculateMissingSkills = (
  currentSkills,
  requiredSkills
) => {
  const currentSkillKeys = new Set(
    currentSkills.map(getSkillKey)
  );

  return requiredSkills.filter(
    (skill) => !currentSkillKeys.has(getSkillKey(skill))
  );
};

// =====================================================
// 2. CV TEXT EXTRACTION
// =====================================================

const extractTextFromCV = async (
  fileBuffer,
  fileName,
  fileType
) => {
  const extension = path.extname(fileName).toLowerCase();

  // PDF extraction.
  if (
    fileType === "application/pdf" ||
    extension === ".pdf"
  ) {
    const { getDocument } = await import("pdfjs-serverless");

    const loadingTask = getDocument({
      data: new Uint8Array(fileBuffer),
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const extractedPages = [];

    try {
      for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber++
      ) {
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

  // DOCX extraction.
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
  if (
    fileType === "application/msword" ||
    extension === ".doc"
  ) {
    const error = new Error(
      "DOC files are accepted for upload, but text extraction is not supported yet."
    );

    error.statusCode = 415;
    throw error;
  }

  // Plain text extraction.
  if (
    fileType === "text/plain" ||
    extension === ".txt"
  ) {
    return fileBuffer.toString("utf-8");
  }

  const error = new Error("Unsupported CV file type.");
  error.statusCode = 415;
  throw error;
};

// =====================================================
// 3. CV SANITIZATION AND DATABASE OPERATIONS
// =====================================================

const sanitizeCVText = async (extractedText) => {
  return sanitizePII(extractedText);
};

const saveExtractedText = async ({
  cvId,
  targetJobTitle,
  industryFocus,
  careerStage,
  primaryGoal,
  extractedText,
  sanitizedText,
}) => {
  return CVAnalysis.create({
    cvId,
    targetJobTitle,
    industryFocus,
    careerStage,
    primaryGoal,
    extractedText,
    sanitizedText,
  });
};

const getCVAnalysis = async (cvId) => {
  return CVAnalysis.findOne({
    where: { cvId },
    order: [["createdAt", "DESC"]],
  });
};

const getCVAnalysisHistory = async (cvId) => {
  return CVAnalysis.findAll({
    where: { cvId },
    order: [["createdAt", "DESC"]],
  });
};

const saveAIAnalysisResult = async (
  analysisId,
  analysisResult
) => {
  const analysis = await CVAnalysis.findByPk(analysisId);

  if (!analysis) {
    return null;
  }

  await analysis.update({
    analysisResult,
  });

  return analysis;
};

// =====================================================
// 4. RETRIEVE AND EXTRACT CV
// =====================================================

const extractAndSanitizeCV = async (cv) => {
  console.log("[CV ANALYSIS] Starting R2 retrieval");

  const cvObject = await getCVFromR2(cv.filePath);

  if (!cvObject || !cvObject.Body) {
    const error = new Error(
      "CV file content could not be retrieved from R2 storage."
    );

    error.statusCode = 404;
    throw error;
  }

  console.log("[CV ANALYSIS] R2 retrieval completed");

  const fileBuffer = Buffer.from(
    await cvObject.Body.transformToByteArray()
  );

  console.log("[CV ANALYSIS] Starting CV text extraction");

  const extractedText = await extractTextFromCV(
    fileBuffer,
    cv.fileName,
    cv.fileType
  );

  if (!extractedText || !extractedText.trim()) {
    const error = new Error(
      "No readable text was found in the CV."
    );

    error.statusCode = 400;
    throw error;
  }

  console.log("[CV ANALYSIS] CV text extraction completed", {
    textLength: extractedText.length,
  });

  const sanitizedText = await sanitizeCVText(extractedText);

  console.log("[CV ANALYSIS] PII sanitization completed");

  return {
    extractedText,
    sanitizedText,
  };
};

// =====================================================
// 5. GAP ANALYSIS
// =====================================================

const processGapAnalysis = async ({
  cv,
  analysis,
  sanitizedText,
  targetJobTitle,
  industryFocus,
  careerStage,
}) => {
  let skillGap;

  try {
    // Create a pending SkillGap record.
    console.log("[CV ANALYSIS] Creating SkillGap record");

    skillGap = await createSkillGap(cv.userId, {
      cvId: cv.id,
      targetJobTitle,
      currentSkills: [],
      requiredSkills: [],
    });

    console.log("[CV ANALYSIS] SkillGap created");

    // Send sanitized CV content to Gemini.
    console.log("[CV ANALYSIS] Starting Gemini gap analysis");

    const aiResponse = await analyzeCVWithAI({
      cvId: cv.id,
      sanitizedText,
      targetJobTitle,
      industryFocus,
      careerStage,
    });

    const result = aiResponse?.analysis ?? aiResponse;

    if (!result) {
      throw new Error(
        "The AI service returned no gap analysis result."
      );
    }

    // Normalize identified and required skills.
    const currentSkills = normalizeSkillNames(
      result.identified_skills
    );

    const requiredSkills = normalizeSkillNames(
      result.required_skills
    );

    // Calculate missing skills on the backend.
    const missingSkills = calculateMissingSkills(
      currentSkills,
      requiredSkills
    );

    const normalizedAnalysisResult = {
      ...result,
      identified_skills: currentSkills,
      required_skills: requiredSkills,
      skill_gaps: missingSkills,
    };

    console.log("[CV ANALYSIS] Skill comparison completed", {
      currentSkills: currentSkills.length,
      requiredSkills: requiredSkills.length,
      missingSkills: missingSkills.length,
    });

    // Save the AI analysis.
    const savedAnalysis = await saveAIAnalysisResult(
      analysis.id,
      normalizedAnalysisResult
    );

    if (!savedAnalysis) {
      throw new Error(
        "Could not save the CV analysis result."
      );
    }

    // Complete the SkillGap record.
    const completedSkillGap = await completeSkillGapAnalysis(
      skillGap.id,
      cv.userId,
      {
        currentSkills,
        requiredSkills,
        missingSkills,
        analysisResult: normalizedAnalysisResult,
      }
    );

    if (!completedSkillGap) {
      throw new Error(
        "Could not complete the SkillGap analysis."
      );
    }

    console.log("[CV ANALYSIS] Gap analysis completed");

    return {
      analysis: savedAnalysis,
      skillGap: completedSkillGap,
      roadmap: null,
      sanitizedText,
    };
  } catch (error) {
    console.error("[CV ANALYSIS] Gap analysis failed:", {
      message: error.message,
      status: error.statusCode || error.status,
    });

    if (skillGap) {
      try {
        await failSkillGapAnalysis(skillGap.id, cv.userId);
      } catch (statusError) {
        console.error(
          "[CV ANALYSIS] Could not mark SkillGap as failed:",
          statusError.message
        );
      }
    }

    throw error;
  }
};

// =====================================================
// 6. CV REVIEW
// =====================================================

const processCVReview = async ({
  cv,
  analysis,
  sanitizedText,
  targetJobTitle,
  industryFocus,
  careerStage,
}) => {
  console.log("[CV ANALYSIS] Starting CV review");

  const aiResponse = await reviewCVWithAI({
    cvId: cv.id,
    sanitizedText,
    targetJobTitle,
    industryFocus,
    careerStage,
  });

  const result = aiResponse?.analysis ?? aiResponse;

  if (!result) {
    throw new Error(
      "The AI service returned no CV review result."
    );
  }

  const savedAnalysis = await saveAIAnalysisResult(
    analysis.id,
    result
  );

  if (!savedAnalysis) {
    throw new Error(
      "Could not save the CV review result."
    );
  }

  console.log("[CV ANALYSIS] CV review completed");

  return {
    analysis: savedAnalysis,
    skillGap: null,
    roadmap: null,
    sanitizedText,
  };
};

// =====================================================
// 7. ROADMAP GENERATION
// =====================================================

const processRoadmapGeneration = async ({
  cv,
  analysis,
  sanitizedText,
  targetJobTitle,
  industryFocus,
  careerStage,
}) => {
  // A roadmap requires a completed SkillGap first.
  // Generate the gap analysis before creating the roadmap.
  const gapResult = await processGapAnalysis({
    cv,
    analysis,
    sanitizedText,
    targetJobTitle,
    industryFocus,
    careerStage,
  });

  if (!gapResult.skillGap) {
    throw new Error(
      "A completed skill-gap analysis is required before generating a roadmap."
    );
  }

  console.log("[CV ANALYSIS] Generating personalized roadmap");

  // Use the existing roadmap service.
  const roadmap = await generateRoadmap(
    cv.userId,
    gapResult.skillGap.id
  );

  if (!roadmap) {
    throw new Error(
      "The roadmap could not be generated."
    );
  }

  console.log("[CV ANALYSIS] Roadmap generated successfully");

  return {
    ...gapResult,
    roadmap,
  };
};

// =====================================================
// 8. PROCESS CV ANALYSIS
// =====================================================

const processCVAnalysis = async ({
  cv,
  targetJobTitle,
  industryFocus,
  careerStage,
  primaryGoal,
}) => {
  const supportedGoals = [
    "CV Review",
    "Gap Analysis",
    "Roadmap",
  ];

  if (!supportedGoals.includes(primaryGoal)) {
    const error = new Error(
      "Invalid analysis goal. Choose CV Review, Gap Analysis or Roadmap."
    );

    error.statusCode = 400;
    throw error;
  }

  // Retrieve, extract and sanitize the uploaded CV.
  const {
    extractedText,
    sanitizedText,
  } = await extractAndSanitizeCV(cv);

  // Save the initial analysis record.
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

  // Execute the selected survey goal.
  switch (primaryGoal) {
    case "CV Review":
      return processCVReview({
        cv,
        analysis,
        sanitizedText,
        targetJobTitle,
        industryFocus,
        careerStage,
      });

    case "Gap Analysis":
      return processGapAnalysis({
        cv,
        analysis,
        sanitizedText,
        targetJobTitle,
        industryFocus,
        careerStage,
      });

    case "Roadmap":
      return processRoadmapGeneration({
        cv,
        analysis,
        sanitizedText,
        targetJobTitle,
        industryFocus,
        careerStage,
      });

    default:
      throw new Error("Unsupported CV analysis goal.");
  }
};

// =====================================================
// 9. EXPORT FUNCTIONS
// =====================================================

export {
  extractTextFromCV,
  saveExtractedText,
  getCVAnalysis,
  sanitizeCVText,
  saveAIAnalysisResult,
  processCVAnalysis,
  getCVAnalysisHistory,
};
