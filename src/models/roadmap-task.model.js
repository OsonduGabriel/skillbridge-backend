import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const ROADMAP_PHASES = [30, 60, 90];
export const ROADMAP_TASK_TYPES = ["learn", "project", "practice", "apply"];
export const ROADMAP_TASK_STATUSES = ["todo", "in_progress", "done"];

const RoadmapTask = sequelize.define(
  "RoadmapTask",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roadmapId: { type: DataTypes.UUID, allowNull: false },
    phase: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isIn: [ROADMAP_PHASES] },
    },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    taskType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [ROADMAP_TASK_TYPES] },
    },
    skill: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: { isLowercase: true },
    },
    recommendationId: { type: DataTypes.UUID, allowNull: true },
    resourceUrl: { type: DataTypes.STRING(500), allowNull: true },
    estimatedHours: { type: DataTypes.FLOAT, allowNull: true },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "todo",
      validate: { isIn: [ROADMAP_TASK_STATUSES] },
    },
    completedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "roadmap_tasks",
    timestamps: true,
    indexes: [{ fields: ["roadmapId", "phase", "position"] }],
  },
);

export default RoadmapTask;
