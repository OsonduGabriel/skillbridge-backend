//database model for cv uploads

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CV = sequelize.define(
  "CV",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "cvs",
    timestamps: true,
  }
);

export default CV;