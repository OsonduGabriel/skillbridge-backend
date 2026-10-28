
import {
  createCV,
  getUserCVs,
  deleteCV,
  updateCV as updateCVService,
  getCVFile,
} from "../services/cv.service.js";

/**
 * Remove internal storage details before returning a CV to the client.
 * This does not modify the Sequelize instance or database record.
 */
const serializeCV = (cv) => {
  if (!cv) {
    return null;
  }

  const record =
    typeof cv.toJSON === "function" ? cv.toJSON() : { ...cv };

  delete record.filePath;

  return record;
};

// Upload a new CV.
const uploadCV = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CV.",
      });
    }

    const userId = req.user.id;

    const cvData = {
      userId,
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
    };

    const cv = await createCV(cvData);

    return res.status(201).json({
      success: true,
      message: "CV uploaded successfully.",
      data: serializeCV(cv),
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all CVs belonging to the authenticated user.
const getMyCVs = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cvs = await getUserCVs(userId);

    return res.status(200).json({
      success: true,
      message: "CVs retrieved successfully.",
      data: cvs.map(serializeCV),
    });
  } catch (error) {
    next(error);
  }
};

// Delete a CV belonging to the authenticated user.
const removeCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;

    const cv = await deleteCV(cvId, userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "CV deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Replace an existing CV with a newly uploaded file.
const updateCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a new CV.",
      });
    }

    const cv = await updateCVService(cvId, userId, req.file);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "CV updated successfully.",
      data: serializeCV(cv),
    });
  } catch (error) {
    next(error);
  }
};

// Download a CV without exposing its storage path in a JSON response.
const downloadCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;

    const cv = await getCVFile(cvId, userId);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    return res.download(cv.filePath, cv.fileName, (error) => {
      if (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  uploadCV,
  getMyCVs,
  removeCV,
  updateCV,
  downloadCV,
};
