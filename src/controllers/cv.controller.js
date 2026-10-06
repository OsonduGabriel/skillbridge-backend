import { createCV } from "../services/cv.service.js";

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

export { uploadCV };