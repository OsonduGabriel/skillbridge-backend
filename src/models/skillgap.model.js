
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Validate that a value is an array containing non-empty strings.
const isStringArray = (value) =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      typeof item === "string" &&
      item.trim().length > 0
  );

const SkillGap = sequelize.define(
  "SkillGap",
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

    cvId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    targetJobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Target job title is required.",
        },
      },
    },

    currentSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isStringArray,
      },
    },

    requiredSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isStringArray,
      },
    },

    missingSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isStringArray,
      },
    },

    analysisResult: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("completed", "pending", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "skill_gaps",
    timestamps: true,
    indexes: [{ fields: ["userId"] }],
  }
);

export default SkillGap;
