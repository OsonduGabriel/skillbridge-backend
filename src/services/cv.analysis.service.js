
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

// =====================================================
// 1. SKILL NORMALIZATION
// =====================================================

// Map equivalent skill names to one canonical comparison key.
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

// Use consistent display names for common technologies.
const CANONICAL_SKILL_LABELS = {
  expressjs: "Express.js",
  reactjs: "React.js",
  nodejs: "Node.js",
  postgresql: "PostgreSQL",
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
};

// Generate a normalized key from a skill name.
const getSkillKey = (skill) => {
  const normalized = skill
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");

  return SKILL_ALIASES[normalized] || normalized;
};

// Standardize skill names and remove equivalent duplicates.
const normalizeSkillNames = (skills = []) => {
  const uniqueSkills = new Map();

  for (const skill of skills) {
    if (
      typeof skill !== "string" ||
      !skill.trim()
    ) {
      continue;
    }

    const trimmedSkill = skill.trim();
    const canonicalKey = getSkillKey(trimmedSkill);

    const displayName =
      CANONICAL_SKILL_LABELS[canonicalKey] ||
      trimmedSkill;

    // Use the canonical key, not the original skill name.
    // This makes Express and Express.js the same Map entry.
    if (!uniqueSkills.has(canonicalKey)) {
      uniqueSkills.set(canonicalKey, displayName);
    }
  }

  return Array.from(uniqueSkills.values());
};

// Calculate missing skills using canonical comparison keys.
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

  // Extract text from PDF.
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
  if (
    fileType === "application/msword" ||
    extension === ".doc"
  ) {
    throw new Error(
      "DOC files are accepted for upload, but text extraction is not supported yet."
    );
  }

  // Extract plain text.
  if (
    fileType === "text/plain" ||
    extension === ".txt"
  ) {
    return fileBuffer.toString("utf-8");
  }

  throw new Error("Unsupported CV file type.");
};

// =====================================================
// 3. CV SANITIZATION AND DATABASE OPERATIONS
// =====================================================

const sanitizeCVText = (extractedText) => {
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

const getCVAnalysis = async (cvId) => {
  const analysis = await CVAnalysis.findOne({
    where: { cvId },
    order: [["createdAt", "DESC"]],
  });

  return analysis;
};

const getCVAnalysisHistory = async (cvId) => {
  const analyses = await CVAnalysis.findAll({
    where: { cvId },
    order: [["createdAt", "DESC"]],
  });

  return analyses;
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
// 4. PROCESS CV ANALYSIS
// =====================================================

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

  // Step 1: Retrieve the uploaded CV from R2.
  console.log("[CV ANALYSIS] Starting R2 retrieval");

  const cvObject = await getCVFromR2(cv.filePath);

  if (!cvObject) {
    const error = new Error("CV file not found in R2 storage.");
    error.statusCode = 404;
    throw error;
  }

  console.log("[CV ANALYSIS] R2 retrieval completed");

  // Step 2: Convert the R2 object into a Buffer.
  if (!cvObject.Body) {
    throw new Error("CV file content is missing from R2 storage.");
  }

  const fileBuffer = Buffer.from(
    await cvObject.Body.transformToByteArray()
  );

  // Step 3: Extract text from the CV.
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
      throw new Error(
        "The AI service returned no analysis result."
      );
    }

    // Step 8: Normalize current and required skills.
    console.log("[CV ANALYSIS] Normalizing skills");

    const currentSkills = normalizeSkillNames(
      result.identified_skills
    );

    const requiredSkills = normalizeSkillNames(
      result.required_skills
    );

    // Step 9: Calculate missing skills on the backend.
    // The AI-generated skill_gaps array is not trusted as
    // the final source of truth.
    const missingSkills = calculateMissingSkills(
      currentSkills,
      requiredSkills
    );

    // Update the analysis result so the CVAnalysis record
    // and SkillGap record contain the same normalized data.
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

    // Step 10: Save the normalized AI analysis result.
    console.log("[CV ANALYSIS] Saving AI analysis result");

    const savedAnalysis = await saveAIAnalysisResult(
      analysis.id,
      normalizedAnalysisResult
    );

    if (!savedAnalysis) {
      throw new Error(
        "Could not save the CV analysis result."
      );
    }

    console.log("[CV ANALYSIS] AI analysis result saved");

    // Step 11: Complete the SkillGap record.
    // The SkillGap service also verifies the missing skills.
    console.log("[CV ANALYSIS] Completing SkillGap analysis");

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
        "Could not save the SkillGap analysis result."
      );
    }

    console.log("[CV ANALYSIS] SkillGap analysis completed");

    return {
      analysis: savedAnalysis,
      skillGap: completedSkillGap,
      sanitizedText,
    };
  } catch (error) {
    console.error("[CV ANALYSIS] Processing failed:", {
      message: error.message,
      status: error.statusCode || error.status,
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

// =====================================================
// 5. EXPORT FUNCTIONS
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
