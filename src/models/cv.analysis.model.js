import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CVAnalysis = sequelize.define(
  "CVAnalysis",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    cvId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    targetJobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    industryFocus: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    careerStage: {
      type: DataTypes.ENUM(
        "Student",
        "Entry",
        "Mid",
        "Senior",
        "Pivot"
      ),
      allowNull: false,
    },

    primaryGoal: {
      type: DataTypes.ENUM(
        "CV Review",
        "Gap Analysis",
        "Roadmap"
      ),
      allowNull: false,
    },

    extractedText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    sanitizedText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    analysisResult: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "cv_analyses",
    timestamps: true,
  }
);

export default CVAnalysis;