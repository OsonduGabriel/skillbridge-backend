
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Profile = sequelize.define(
  "Profile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    education: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    careerGoal: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Career information from the profile survey
    targetJobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    industryFocus: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    careerStage: {
      type: DataTypes.ENUM(
        "Student",
        "Entry",
        "Mid",
        "Senior",
        "Pivot"
      ),
      allowNull: true,
    },

    primaryGoal: {
      type: DataTypes.ENUM(
        "CV Review",
        "Gap Analysis",
        "Roadmap"
      ),
      allowNull: true,
    },

    // Monthly salary expectations
    payMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    payMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Preferred work arrangement
    workMode: {
      type: DataTypes.ENUM(
        "remote",
        "hybrid",
        "onsite"
      ),
      allowNull: true,
    },
  },
  {
    tableName: "profiles",
    timestamps: true,
  }
);

export default Profile;
