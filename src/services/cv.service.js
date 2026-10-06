import CV from "../models/cv.model.js";

const createCV = async (cvData) => {
  const cv = await CV.create(cvData);

  return cv;
};

export { createCV };