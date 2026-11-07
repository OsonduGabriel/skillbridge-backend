import CV from "../models/cv.model.js";
import CVAnalysis from "../models/cv.analysis.model.js";
import { uploadCVToR2, deleteCVFromR2, } from "./cv-storage.service.js";

// Delete an R2 object without hiding the original operation's result.
const cleanupR2Object = async (fileKey, context) => {
  try {
    await deleteCVFromR2(fileKey);
  } catch (error) {
    console.error(context, {
      fileKey,
      message: error.message,
    });
  }
};

// Upload CV to R2 and save its metadata in PostgreSQL.
const createCV = async (cvData, file) => {
  const filePath = await uploadCVToR2(file, cvData.userId);

  try {
    return await CV.create({
      ...cvData,
      filePath,
    });
  } catch (error) {
    await cleanupR2Object(
      filePath,
      "Failed to clean up CV after database creation failed."
    );

    throw error;
  }
};

// Retrieve all CVs belonging to a user.
const getUserCVs = async (userId) => {
  return CV.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });
};

// Delete CV metadata and its R2 object.
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

  const filePath = cv.filePath;

  // Delete the database record first.
  await cv.destroy();

  // Clean up the corresponding R2 object.
  await cleanupR2Object(
    filePath,
    "CV database record deleted, but R2 cleanup failed."
  );

  return cv;
};

// Replace an existing CV.
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

  // Upload the replacement before modifying the database.
  const newFilePath = await uploadCVToR2(file, userId);

  const transaction = await CV.sequelize.transaction();

  try {
    await cv.update(
      {
        fileName: file.originalname,
        filePath: newFilePath,
        fileType: file.mimetype,
        fileSize: file.size,
      },
      { transaction }
    );

    // Remove analyses associated with the previous CV.
    await CVAnalysis.destroy({
      where: { cvId },
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback().catch((rollbackError) => {
      console.error("CV database rollback failed:", rollbackError);
    });

    await cleanupR2Object(
      newFilePath,
      "Failed to clean up replacement CV."
    );

    throw error;
  }

  // Delete the previous R2 object after successful database update.
  await cleanupR2Object(
    oldFilePath,
    "CV replaced, but previous R2 object cleanup failed."
  );

  return cv;
};

// Retrieve a CV database record.
const getCVFile = async (cvId, userId) => {
  return CV.findOne({
    where: {
      id: cvId,
      userId,
    },
  });
};

export {
  createCV,
  getUserCVs,
  deleteCV,
  updateCV,
  getCVFile,
};
