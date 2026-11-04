
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Course = sequelize.define(
    "Course",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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

        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        difficulty: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "beginner",
            validate: {
                isIn: [["beginner", "intermediate", "advanced"]],
            },
        },

        providerType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "internal",
            validate: {
                isIn: [["internal", "external"]],
            },
        },

        providerName: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },

        externalUrl: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            validate: {
                isUrlOrNull(value) {
                    if (value && !/^https?:\/\/.+/i.test(value)) {
                        throw new Error("External course URL must be a valid HTTP or HTTPS URL.");
                    }
                },
            },
        },

        thumbnailUrl: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },

        estimatedHours: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: {
                min: 0,
            },
        },

        isPublished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "courses",
        timestamps: true,
        indexes: [
            { fields: ["category"] },
            { fields: ["providerType"] },
            { fields: ["isPublished"] },
        ],
    }
);

export default Course;
