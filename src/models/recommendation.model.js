
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Recommendation = sequelize.define(
  "Recommendation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("learning_resource", "project"),
      allowNull: false,
    },

    url: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },

    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "skill_id",
      references: {
        model: "skills",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    difficulty: {
      type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
      allowNull: false,
      defaultValue: "beginner",
    },

    estimatedHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "estimated_hours",
      validate: {
        min: 1,
      },
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "recommendations",
    timestamps: true,
    underscored: true,
  }
);

export default Recommendation;
