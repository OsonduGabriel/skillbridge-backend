
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const LessonProgress = sequelize.define(
    "LessonProgress",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        enrollmentId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        lessonId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        isCompleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "lesson_progress",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["enrollmentId", "lessonId"],
            },
        ],
    }
);

export default LessonProgress;
