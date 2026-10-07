//*Extract text from CV using cv analysis and save in database 

import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import CVAnalysis from "../models/cv.analysis.model.js";
import sanitizePII from "../utils/pii.sanitizer.js";


const extractTextFromCV = async (filePath, fileType) => {
  const extension = path.extname(filePath).toLowerCase();

  if (fileType === "application/pdf" || extension === ".pdf") {
    const fileBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(fileBuffer);

    return pdfData.text;
  }

  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || extension === ".docx") {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value;
  }

  if (fileType === "application/msword" || extension === ".doc") {
    throw new Error("DOC files are currently accepted for upload, but text extraction is not supported yet.");
  }

  if (fileType === "text/plain" || extension === ".txt") {
  const text = await fs.readFile(filePath, "utf-8");

  return text;
}

  throw new Error("Unsupported CV file type.");
};


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
  });

  return analysis;
};

export { extractTextFromCV, saveExtractedText, getCVAnalysis, sanitizeCVText };