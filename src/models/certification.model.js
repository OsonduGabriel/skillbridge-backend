
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Certification = sequelize.define(
    "Certification",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        courseId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
        },

        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        completionRequired: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 100,
            validate: {
                min: 1,
                max: 100,
            },
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "certifications",
        timestamps: true,
    }
);

export default Certification;
