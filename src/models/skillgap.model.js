import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const lowercaseStringArray = (value) =>
  Array.isArray(value) &&
  value.every(
    (item) => typeof item === "string" && item.length > 0 && item === item.toLowerCase(),
  );

const SkillGap = sequelize.define(
  "SkillGap",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    targetJobTitle: { type: DataTypes.STRING(200), allowNull: false },
    currentSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: { isLowercaseStringArray: lowercaseStringArray },
    },
    requiredSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: { isLowercaseStringArray: lowercaseStringArray },
    },
    missingSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: { isLowercaseStringArray: lowercaseStringArray },
    },
  },
  {
    tableName: "skill_gaps",
    timestamps: true,
    indexes: [{ fields: ["userId"] }],
  },
);

export default SkillGap;
