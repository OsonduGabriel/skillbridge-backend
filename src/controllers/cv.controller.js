import { createCV, getUserCVs, deleteCV, updateCV as updateCVService, getCVFile, } from "../services/cv.service.js";
import { getCVFromR2, } from "../services/cv-storage.service.js";

// Remove internal storage details before returning CV records.
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
      fileType: file.mimetype,
      fileSize: file.size,
    };

    // The service uploads the buffer to R2 and saves metadata.
    const cv = await createCV(cvData, file);

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
    const cvs = await getUserCVs(req.user.id);

    return res.status(200).json({
      success: true,
      message: "CVs retrieved successfully.",
      data: cvs.map(serializeCV),
    });
  } catch (error) {
    next(error);
  }
};

// Delete a CV.
const removeCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;

    const cv = await deleteCV(cvId, req.user.id);

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

// Replace an existing CV.
const updateCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a new CV.",
      });
    }

    const cv = await updateCVService(
      cvId,
      req.user.id,
      req.file
    );

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

// Download a CV from private R2 storage.
const downloadCV = async (req, res, next) => {
  try {
    const { cvId } = req.params;

    const cv = await getCVFile(cvId, req.user.id);

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    const object = await getCVFromR2(cv.filePath);

    if (!object) {
      return res.status(404).json({
        success: false,
        message: "CV file not found in storage. Please upload it again.",
      });
    }

    const buffer = Buffer.from(await object.arrayBuffer());

    res.attachment(cv.fileName);

    res.setHeader(
      "Content-Type",
      cv.fileType || "application/octet-stream"
    );

    res.setHeader("Content-Length", String(buffer.length));

    return res.send(buffer);
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
