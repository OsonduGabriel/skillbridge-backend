
/**
 * Converts a Sequelize CV record into a safe API response.
 *
 * Keeps filePath in the database for internal file operations,
 * but never exposes it in the API response.
 */

const serializeCV = (cv) => {
  if (!cv) {
    return null;
  }

  // Convert Sequelize instances into plain objects.
  const record =
    typeof cv.toJSON === "function" ? cv.toJSON() : { ...cv };

  delete record.filePath;

  return record;
};

export default serializeCV;
