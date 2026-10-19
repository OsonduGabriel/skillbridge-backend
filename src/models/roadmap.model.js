import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const ROADMAP_STATUSES = [
  "draft",
  "active",
  "completed",
  "archived",
];
export const ROADMAP_GENERATORS = ["ai", "manual"];

const Roadmap = sequelize.define(
  "Roadmap",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    skillGapId: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    targetRole: { type: DataTypes.STRING(200), allowNull: false },
    summary: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "draft",
      validate: { isIn: [ROADMAP_STATUSES] },
    },
    generatedBy: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "manual",
      validate: { isIn: [ROADMAP_GENERATORS] },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "roadmaps",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["skillGapId"] }],
  },
);

export default Roadmap;
