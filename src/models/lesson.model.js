
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Lesson = sequelize.define(
    "Lesson",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        moduleId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        contentType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "article",
            validate: {
                isIn: [["video", "article", "quiz", "practical"]],
            },
        },

        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        resourceUrl: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },

        durationMinutes: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
            },
        },

        position: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
        },

        isPreview: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "lessons",
        timestamps: true,
        indexes: [
            { fields: ["moduleId", "position"] },
        ],
    }
);

export default Lesson;
