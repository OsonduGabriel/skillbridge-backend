
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserSkill = sequelize.define(
  "UserSkill",
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      field: "user_id",
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    skillId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "skill_id",
      references: { model: "skills", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    proficiencyLevel: {
      type: DataTypes.ENUM(
        "beginner",
        "intermediate",
        "advanced",
        "expert"
      ),
      allowNull: false,
      defaultValue: "beginner",
      field: "proficiency_level",
    },
  },
  {
    tableName: "user_skills",
    timestamps: true,
    underscored: true,
  }
);

export default UserSkill;
