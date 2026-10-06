import { createCV, getUserCVs, deleteCV, updateCV as updateCVService, getCVFile } from "../services/cv.service.js";

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
      data: cv,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCVs = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cvs = await getUserCVs(userId);

    return res.status(200).json({
      success: true,
      message: "CVs retrieved successfully.",
      data: cvs,
    });
  } catch (error) {
    next(error);
  }
};

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

    const cv = await updateCVService(
      cvId,
      userId,
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
      data: cv,
    });
  } catch (error) {
    next(error);
  }
};

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

    return res.download(
      cv.filePath,
      cv.fileName,
      (error) => {
        if (error) {
          next(error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

export { uploadCV, getMyCVs, removeCV, updateCV, downloadCV };