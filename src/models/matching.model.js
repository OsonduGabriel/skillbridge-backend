
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Matching = sequelize.define(
  "Matching",
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

    opportunityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    matchPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },

    matchedSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    missingSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "completed",
        "failed"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
   },
  {
    tableName: "career_matches",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "opportunityId"],
      },
    ],
  }
);

export default Matching;
