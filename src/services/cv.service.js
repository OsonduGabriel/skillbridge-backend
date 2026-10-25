import fs from "fs/promises";
import CV from "../models/cv.model.js";
import CVAnalysis from "../models/cv.analysis.model.js";

//upload cv
const createCV = async (cvData) => {
  const cv = await CV.create(cvData);

  return cv;
};

//users can view cv
const getUserCVs = async (userId) => {
  const cvs = await CV.findAll({
    where: {
      userId,
    },
    order: [["createdAt", "DESC"]],
  });

  return cvs;
};

const deleteCV = async (cvId, userId) => {
  const cv = await CV.findOne({
    where: {
      id: cvId,
      userId,
    },
  });

  if (!cv) {
    return null;
  }
//delete the physical uploaded cv file
  try {
    await fs.unlink(cv.filePath);
  } catch (error) {
    // Continue deleting the database record if the file is already missing.
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
//delete cv from database record
  await cv.destroy();

  return cv;
};

const updateCV = async (cvId, userId, file) => {
  const cv = await CV.findOne({
    where: {
      id: cvId,
      userId,
    },
  });

  if (!cv) {
    return null;
  }

  const oldFilePath = cv.filePath;

  await cv.update({
    fileName: file.originalname,
    filePath: file.path,
    fileType: file.mimetype,
    fileSize: file.size,
  });

  try {
    await fs.unlink(oldFilePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  // Remove previous analysis because the CV content has changed.
  await CVAnalysis.destroy({
    where: {
      cvId,
    },
  });

  return cv;
};

//download cv
const getCVFile = async (cvId, userId) => {
  const cv = await CV.findOne({
    where: {
      id: cvId,
      userId,
    },
  });

  return cv;
};

export { createCV, getUserCVs, deleteCV, updateCV, getCVFile };