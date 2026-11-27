
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const OPPORTUNITY_TYPES = [
  "internship",
  "job",
  "graduate_program",
  "fellowship",
  "freelance",
];

export const WORK_MODES = [
  "remote",
  "hybrid",
  "onsite",
];

export const OPPORTUNITY_STATUSES = [
  "active",
  "expired",
  "closed",
];

export const OPPORTUNITY_SOURCES = [
  "manual",
  "aggregated",
  "seed",
];

// Validate skills stored in JSONB fields.
const validateSkillArray = (value) => {
  if (!Array.isArray(value)) {
    throw new Error("Skills must be an array.");
  }

  const invalidSkill = value.some(
    (skill) =>
      typeof skill !== "string" ||
      !skill.trim(),
  );

  if (invalidSkill) {
    throw new Error(
      "Every skill must be a non-empty string.",
    );
  }
};

const Opportunity = sequelize.define(
  "Opportunity",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },

    company: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 150],
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    type: {
      type: DataTypes.ENUM(...OPPORTUNITY_TYPES),
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Physical or geographical location.
    location: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    // Nullable because some listings have ambiguous work arrangements.
    workMode: {
      type: DataTypes.ENUM(...WORK_MODES),
      allowNull: true,
      defaultValue: null,
    },

    applicationUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
      },
    },

    // Application deadline, not verification date.
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // Original publication date from the dataset.
    // Stored as text because the workbook provides month/year values.
    postingDate: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // Original platform where the opportunity was listed.
    sourcePlatform: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Original listing page, separate from the application URL.
    sourceUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },

    requiredSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        validateSkillArray,
      },
    },

    preferredSkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        validateSkillArray,
      },
    },

    // Availability status of the opportunity.
    status: {
      type: DataTypes.ENUM(...OPPORTUNITY_STATUSES),
      allowNull: false,
      defaultValue: "active",
    },

    // Original verification label supplied by the dataset.
    // This does not mean SkillBridge independently verified the listing.
    verificationStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // Date on which the dataset says the listing was verified.
    verificationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // Where the record entered SkillBridge.
    source: {
      type: DataTypes.ENUM(...OPPORTUNITY_SOURCES),
      allowNull: false,
      defaultValue: "manual",
    },

    // Dataset/provider name.
    sourceName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    // Unique identifier from the original dataset/provider.
    externalId: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    // Used to track when an aggregated listing was last seen.
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "opportunities",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["sourceName", "externalId"],
      },
      {
        fields: ["status", "deadline"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["source"],
      },
      {
        fields: ["sourcePlatform"],
      },
      {
        fields: ["sourceName", "lastSeenAt"],
      },
      {
        using: "GIN",
        fields: ["requiredSkills"],
      },
      {
        using: "GIN",
        fields: ["preferredSkills"],
      },
    ],

    validate: {
      validateSourceIdentity() {
        const hasSourceName = Boolean(
          this.sourceName?.trim(),
        );

        const hasExternalId = Boolean(
          this.externalId?.trim(),
        );

        if (hasSourceName !== hasExternalId) {
          throw new Error(
            "sourceName and externalId must either both be provided or both be null.",
          );
        }

        if (
          ["seed", "aggregated"].includes(this.source) &&
          (!hasSourceName || !hasExternalId)
        ) {
          throw new Error(
            "Seed and aggregated opportunities require sourceName and externalId.",
          );
        }
      },
    },
  },
);

export default Opportunity;
