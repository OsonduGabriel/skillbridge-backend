import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
emailVerificationCodeHash: {
  type: DataTypes.STRING,
  allowNull: true,
},

emailVerificationExpiresAt: {
  type: DataTypes.DATE,
  allowNull: true,
},

emailVerificationAttempts: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
},
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordResetCodeHash: {
  type: DataTypes.STRING,
  allowNull: true,
},
  passwordResetExpiresAt: {
  type: DataTypes.DATE,
  allowNull: true,
},
  passwordResetAttempts: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
},
    role: {
      type: DataTypes.ENUM(
        "student",
        "mentor",
        "employer",
        "admin"
      ),
      defaultValue: "student",
      allowNull: false,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;