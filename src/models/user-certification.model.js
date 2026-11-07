
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserCertification = sequelize.define(
    "UserCertification",
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

        certificationId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        enrollmentId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
        },

        certificateCode: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        issuedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "user_certifications",
        timestamps: true,
        indexes: [
            { fields: ["userId"] },
            { fields: ["certificationId"] },
        ],
    }
);

export default UserCertification;
