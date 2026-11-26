
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

    // Basic profile information
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
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    industryFocus: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    careerStage: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    primaryGoal: {
      type: DataTypes.STRING(30),
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
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    tableName: "profiles",
    timestamps: true,
  }
);

export default Profile;
