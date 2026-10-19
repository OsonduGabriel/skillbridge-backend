import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const OPPORTUNITY_TYPES = [
  "internship",
  "job",
  "graduate_program",
  "fellowship",
  "freelance",
];
export const WORK_MODES = ["remote", "hybrid", "onsite"];
export const OPPORTUNITY_STATUSES = ["active", "expired", "closed"];
export const OPPORTUNITY_SOURCES = ["manual", "aggregated"];

const Opportunity = sequelize.define(
  "Opportunity",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING(200), allowNull: false },
    company: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: { isIn: [OPPORTUNITY_TYPES] },
    },
    category: { type: DataTypes.STRING(100) },
    location: { type: DataTypes.STRING(150) },
    workMode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "onsite",
      validate: { isIn: [WORK_MODES] },
    },
    applicationUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { isUrl: true },
    },
    deadline: { type: DataTypes.DATE },
    requiredSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    preferredSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
      validate: { isIn: [OPPORTUNITY_STATUSES] },
    },

    // aggregation fields, used later by the aggregation service
    source: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "manual",
      validate: { isIn: [OPPORTUNITY_SOURCES] },
    },
    sourceName: { type: DataTypes.STRING(100) },
    externalId: { type: DataTypes.STRING(255) },
    lastSeenAt: { type: DataTypes.DATE },
  },
  {
    tableName: "opportunities",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["sourceName", "externalId"] }, // stops duplicate imports
      { using: "gin", fields: ["requiredSkills"] },
      { fields: ["status", "deadline"] },
      { fields: ["type"] },
    ],
  },
);

export default Opportunity;
