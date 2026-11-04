
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Enrollment = sequelize.define(
    "Enrollment",
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

        courseId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "active",
            validate: {
                isIn: [["active", "completed", "cancelled"]],
            },
        },

        progressPercentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100,
            },
        },

        enrolledAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "course_enrollments",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["userId", "courseId"],
            },
        ],
    }
);

export default Enrollment;
