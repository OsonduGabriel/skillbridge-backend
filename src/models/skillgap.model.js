
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Career stages accepted by the analysis endpoint and stored on a skill gap.
export const SKILL_GAP_CAREER_STAGES = [
  "Student",
  "Entry",
  "Mid",
  "Senior",
  "Pivot",
];

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

    // The industry and career stage the analysis was run with, so the
    // roadmap is built from the same context. Null for manual or older gaps.
    industryFocus: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    careerStage: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: {
          args: [SKILL_GAP_CAREER_STAGES],
          msg: "Career stage must be Student, Entry, Mid, Senior or Pivot.",
        },
      },
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
