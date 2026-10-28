
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Progress = sequelize.define(
  "Progress",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      unique: "user_recommendation_unique",
    },

    recommendationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "recommendation_id",
      references: {
        model: "recommendations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      unique: "user_recommendation_unique",
    },

    status: {
      type: DataTypes.ENUM(
        "not_started",
        "in_progress",
        "completed"
      ),
      allowNull: false,
      defaultValue: "not_started",
    },

    progressPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "progress_percentage",
      validate: {
        min: 0,
        max: 100,
      },
    },

    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "started_at",
    },

    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completed_at",
    },
  },
  {
    tableName: "learning_progress",
    timestamps: true,
    underscored: true,
  }
);

export default Progress;
