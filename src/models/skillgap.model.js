import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

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
        allowNull: false
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
      defaultValue: []
    },

    requiredSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },

    missingSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },

    analysisResult: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("completed", "pending", "failed"),
      allowNull: false,
      defaultValue: "pending"
    }

  },
  {
    tableName: "skill_gaps",
    timestamps: true,
  }
);

export default SkillGap;