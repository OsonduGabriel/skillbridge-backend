//*Extract text from CV using cv analysis and save in database 

import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import CVAnalysis from "../models/cv.analysis.model.js";

const extractTextFromCV = async (filePath, fileType) => {
  const extension = path.extname(filePath).toLowerCase();

  if (fileType === "application/pdf" || extension === ".pdf") {
    const fileBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(fileBuffer);

    return pdfData.text;
  }

  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === ".docx"
  ) {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value;
  }

  throw new Error("Unsupported CV file type.");
};

const saveExtractedText = async (cvId, extractedText) => {
  const analysis = await CVAnalysis.create({
    cvId,
    extractedText,
  });

  return analysis;
};

const getCVAnalysis = async (cvId) => {
  const analysis = await CVAnalysis.findOne({
    where: { cvId },
  });

  return analysis;
};

export { extractTextFromCV, saveExtractedText, getCVAnalysis };