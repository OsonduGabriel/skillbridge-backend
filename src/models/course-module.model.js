
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CourseModule = sequelize.define(
    "CourseModule",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        courseId: {
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

        position: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
        },
    },
    {
        tableName: "course_modules",
        timestamps: true,
        indexes: [
            { fields: ["courseId", "position"] },
        ],
    }
);

export default CourseModule;
