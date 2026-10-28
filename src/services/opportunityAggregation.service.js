import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Opportunity, {
  OPPORTUNITY_TYPES,
  WORK_MODES,
} from "../models/opportunity.model.js";
import { getOpportunitySources } from "./sources/index.js";
import { expireStaleOpportunities } from "./opportunity.service.js";

const NORMALIZED_FIELDS = [
  "title",
  "company",
  "description",
  "type",
  "category",
  "location",
  "workMode",
  "applicationUrl",
  "deadline",
  "requiredSkills",
  "preferredSkills",
];

const normalizeSkills = (skills, sourceName, field) => {
  if (
    !Array.isArray(skills) ||
    skills.some((skill) => typeof skill !== "string")
  ) {
    throw new TypeError(
      `Source "${sourceName}" returned an invalid ${field} list`,
    );
  }

  return [
    ...new Set(
      skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean),
    ),
  ];
};

const assertSourceAdapter = (adapter) => {
  if (
    !adapter ||
    typeof adapter.sourceName !== "string" ||
    !adapter.sourceName.trim() ||
    adapter.sourceName.trim().length > 100 ||
    typeof adapter.fetch !== "function" ||
    typeof adapter.normalize !== "function"
  ) {
    throw new TypeError(
      "Each opportunity source must provide a sourceName, fetch(), and normalize()",
    );
  }
};

const normalizeRecord = (sourceName, record) => {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new TypeError(`Source "${sourceName}" returned an invalid opportunity`);
  }

  if (
    typeof record.externalId !== "string" ||
    !record.externalId.trim() ||
    record.externalId.length > 255
  ) {
    throw new TypeError(
      `Source "${sourceName}" returned an opportunity without a valid externalId`,
    );
  }

  for (const field of ["title", "company", "description", "applicationUrl"]) {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      throw new TypeError(
        `Source "${sourceName}" returned an opportunity without a valid ${field}`,
      );
    }
  }

  if (
    record.title.length > 200 ||
    record.company.length > 150 ||
    record.applicationUrl.length > 500
  ) {
    throw new TypeError(`Source "${sourceName}" returned an overlong field`);
  }

  try {
    const url = new URL(record.applicationUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    throw new TypeError(
      `Source "${sourceName}" returned an invalid applicationUrl`,
    );
  }

  for (const [field, maxLength] of [
    ["category", 100],
    ["location", 150],
  ]) {
    if (
      record[field] !== undefined &&
      record[field] !== null &&
      (typeof record[field] !== "string" || record[field].length > maxLength)
    ) {
      throw new TypeError(
        `Source "${sourceName}" returned an invalid ${field}`,
      );
    }
  }

  if (
    record.deadline !== undefined &&
    record.deadline !== null &&
    !Number.isFinite(new Date(record.deadline).getTime())
  ) {
    throw new TypeError(`Source "${sourceName}" returned an invalid deadline`);
  }

  if (!OPPORTUNITY_TYPES.includes(record.type)) {
    throw new TypeError(
      `Source "${sourceName}" returned an opportunity with an invalid type`,
    );
  }

  if (record.workMode !== undefined && !WORK_MODES.includes(record.workMode)) {
    throw new TypeError(
      `Source "${sourceName}" returned an opportunity with an invalid workMode`,
    );
  }

  return {
    source: "aggregated",
    sourceName,
    externalId: record.externalId.trim(),
    lastSeenAt: new Date(),
    ...Object.fromEntries(
      NORMALIZED_FIELDS.filter((field) => record[field] !== undefined).map(
        (field) => [
          field,
          field === "requiredSkills" || field === "preferredSkills"
            ? normalizeSkills(record[field], sourceName, field)
            : field === "deadline" && record[field] != null
              ? new Date(record[field])
            : record[field],
        ],
      ),
    ),
  };
};

export const aggregateOpportunities = async (adapters) => {
  if (!Array.isArray(adapters)) {
    throw new TypeError("Opportunity source adapters must be provided as an array");
  }

  const results = [];
  const sourceNames = new Set();
  for (const adapter of adapters) {
    const sourceName =
      typeof adapter?.sourceName === "string" && adapter.sourceName.trim()
        ? adapter.sourceName.trim()
        : "unknown source";

    try {
      assertSourceAdapter(adapter);
      if (sourceNames.has(sourceName)) {
        throw new TypeError(`Duplicate opportunity sourceName "${sourceName}"`);
      }
      sourceNames.add(sourceName);

      const records = await adapter.fetch();
      if (!Array.isArray(records)) {
        throw new TypeError(
          `Source "${sourceName}" fetch() must return an array`,
        );
      }

      const normalizedRecords = [];
      for (const record of records) {
        normalizedRecords.push(
          normalizeRecord(sourceName, await adapter.normalize(record)),
        );
      }

      if (normalizedRecords.length) {
        await sequelize.transaction(async (transaction) => {
          for (const values of normalizedRecords) {
            await Opportunity.upsert(values, {
              conflictFields: ["sourceName", "externalId"],
              fields: Object.keys(values),
              transaction,
            });
          }

          await Opportunity.update(
            { status: "active" },
            {
              where: {
                sourceName,
                externalId: {
                  [Op.in]: normalizedRecords.map((values) => values.externalId),
                },
                status: "expired",
                [Op.or]: [
                  { deadline: null },
                  { deadline: { [Op.gte]: new Date() } },
                ],
              },
              transaction,
            },
          );
        });
      }

      results.push({ sourceName, processed: normalizedRecords.length });
    } catch (error) {
      results.push({
        sourceName,
        processed: 0,
        error: error.message || "Opportunity source failed",
      });
    }
  }

  return {
    processed: results.reduce((total, result) => total + result.processed, 0),
    sources: results,
  };
};

export const runOpportunityAggregation = async () => {
  const aggregation = await aggregateOpportunities(getOpportunitySources());
  const freshness = await expireStaleOpportunities();
  return { ...aggregation, expired: freshness.expired };
};
