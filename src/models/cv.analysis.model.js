//*Store cv analysis Results

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

    extractedText: {
      type: DataTypes.TEXT,
      allowNull: false,
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