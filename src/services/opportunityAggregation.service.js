
import { Op } from "sequelize";
import sequelize from "../config/database.js";

import Opportunity, {
  OPPORTUNITY_TYPES,
  WORK_MODES,
} from "../models/opportunity.model.js";

import { getOpportunitySources } from "./sources/index.js";

import {
  expireStaleOpportunities,
} from "./opportunity.service.js";

// Fields accepted from normalized opportunity source records.
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
];

// Normalize skill arrays returned by a provider.
const normalizeSkills = (
  skills,
  sourceName,
  field
) => {
  if (skills === undefined || skills === null) {
    return [];
  }

  if (
    !Array.isArray(skills) ||
    skills.some(
      (skill) => typeof skill !== "string"
    )
  ) {
    throw new TypeError(
      `Source "${sourceName}" returned an invalid ${field} list`
    );
  }

  return [
    ...new Set(
      skills
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
};

// Validate the structure of a source adapter.
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
      "Each opportunity source must provide a sourceName, fetch(), and normalize()"
    );
  }
};

// Validate and normalize one opportunity record.
const normalizeRecord = (
  sourceName,
  record,
  now = new Date()
) => {
  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record)
  ) {
    throw new TypeError(
      `Source "${sourceName}" returned an invalid opportunity`
    );
  }

  if (
    typeof record.externalId !== "string" ||
    !record.externalId.trim() ||
    record.externalId.trim().length > 255
  ) {
    throw new TypeError(
      `Source "${sourceName}" returned an opportunity without a valid externalId`
    );
  }

  for (const field of [
    "title",
    "company",
    "description",
    "applicationUrl",
  ]) {
    if (
      typeof record[field] !== "string" ||
      !record[field].trim()
    ) {
      throw new TypeError(
        `Source "${sourceName}" returned an opportunity without a valid ${field}`
      );
    }
  }

  if (
    record.title.trim().length > 200 ||
    record.company.trim().length > 150 ||
    record.applicationUrl.trim().length > 500
  ) {
    throw new TypeError(
      `Source "${sourceName}" returned an overlong field`
    );
  }

  // Application URLs must use HTTP or HTTPS.
  const applicationUrl = record.applicationUrl.trim();

  try {
    const url = new URL(applicationUrl);

    if (
      !["http:", "https:"].includes(url.protocol)
    ) {
      throw new Error("Unsupported URL protocol");
    }
  } catch {
    throw new TypeError(
      `Source "${sourceName}" returned an invalid applicationUrl`
    );
  }

  // Validate optional text fields.
  for (const [field, maxLength] of [
    ["category", 100],
    ["location", 150],
  ]) {
    if (
      record[field] !== undefined &&
      record[field] !== null &&
      (
        typeof record[field] !== "string" ||
        record[field].length > maxLength
      )
    ) {
      throw new TypeError(
        `Source "${sourceName}" returned an invalid ${field}`
      );
    }
  }

  // Validate the application deadline.
  let deadline = null;

  if (
    record.deadline !== undefined &&
    record.deadline !== null &&
    record.deadline !== ""
  ) {
    deadline = new Date(record.deadline);

    if (!Number.isFinite(deadline.getTime())) {
      throw new TypeError(
        `Source "${sourceName}" returned an invalid deadline`
      );
    }
  }

  // Validate the opportunity type.
  if (!OPPORTUNITY_TYPES.includes(record.type)) {
    throw new TypeError(
      `Source "${sourceName}" returned an opportunity with an invalid type`
    );
  }

  // Validate the work mode when supplied.
  if (
    record.workMode !== undefined &&
    record.workMode !== null &&
    !WORK_MODES.includes(record.workMode)
  ) {
    throw new TypeError(
      `Source "${sourceName}" returned an opportunity with an invalid workMode`
    );
  }

  // A provider must not reactivate a vacancy whose deadline
  // has already passed.
  const status =
    deadline && deadline < now
      ? "expired"
      : "active";

  const normalizedRecord = {
    source: "aggregated",
    sourceName,
    externalId: record.externalId.trim(),
    lastSeenAt: now,
    status,

    requiredSkills: normalizeSkills(
      record.requiredSkills,
      sourceName,
      "requiredSkills"
    ),

    preferredSkills: normalizeSkills(
      record.preferredSkills,
      sourceName,
      "preferredSkills"
    ),
  };

  // Copy and normalize the accepted opportunity fields.
  for (const field of NORMALIZED_FIELDS) {
    if (field === "deadline") {
      normalizedRecord.deadline = deadline;
      continue;
    }

    if (record[field] !== undefined) {
      normalizedRecord[field] =
        typeof record[field] === "string"
          ? record[field].trim()
          : record[field];
    }
  }

  normalizedRecord.applicationUrl = applicationUrl;

  return normalizedRecord;
};

// Read and validate a provider's fetch response.
//
// Supported response formats:
//
// 1. Array:
//    [record1, record2]
//
//    This is treated as a partial result. It cannot be used
//    to expire old records.
//
// 2. Complete snapshot:
//    {
//      records: [record1, record2],
//      completeSnapshot: true
//    }
//
//    This explicitly confirms that the provider returned
//    its complete available listing set.
//
// 3. Partial snapshot:
//    {
//      records: [record1, record2],
//      completeSnapshot: false
//    }
const normalizeFetchResponse = (
  response,
  sourceName
) => {
  if (Array.isArray(response)) {
    return {
      records: response,
      completeSnapshot: false,
    };
  }

  if (
    !response ||
    typeof response !== "object" ||
    Array.isArray(response)
  ) {
    throw new TypeError(
      `Source "${sourceName}" returned an invalid fetch response`
    );
  }

  if (!Array.isArray(response.records)) {
    throw new TypeError(
      `Source "${sourceName}" must return a records array`
    );
  }

  if (
    typeof response.completeSnapshot !== "boolean"
  ) {
    throw new TypeError(
      `Source "${sourceName}" must specify completeSnapshot as true or false`
    );
  }

  return {
    records: response.records,
    completeSnapshot: response.completeSnapshot,
  };
};

// Aggregate opportunities from all configured source adapters.
export const aggregateOpportunities = async (
  adapters
) => {
  if (!Array.isArray(adapters)) {
    throw new TypeError(
      "Opportunity source adapters must be provided as an array"
    );
  }

  const results = [];
  const sourceNames = new Set();

  // Only these providers are eligible for stale-record checks.
  const successfulSnapshotSources = [];

  for (const adapter of adapters) {
    const sourceName =
      typeof adapter?.sourceName === "string" &&
      adapter.sourceName.trim()
        ? adapter.sourceName.trim()
        : "unknown source";

    try {
      assertSourceAdapter(adapter);

      if (sourceNames.has(sourceName)) {
        throw new TypeError(
          `Duplicate opportunity sourceName "${sourceName}"`
        );
      }

      sourceNames.add(sourceName);

      // Fetch records from the provider.
      const fetchResponse = await adapter.fetch();

      const {
        records,
        completeSnapshot,
      } = normalizeFetchResponse(
        fetchResponse,
        sourceName
      );

      // Normalize every record before saving anything.
      //
      // If one record is invalid, the source's database
      // transaction will not run.
      const now = new Date();

      const normalizedRecords = [];

      for (const record of records) {
        const normalized = await adapter.normalize(record);

        normalizedRecords.push(
          normalizeRecord(
            sourceName,
            normalized,
            now
          )
        );
      }

      // Save all records for this provider in one transaction.
      if (normalizedRecords.length > 0) {
        await sequelize.transaction(
          async (transaction) => {
            for (const values of normalizedRecords) {
              await Opportunity.upsert(values, {
                conflictFields: [
                  "sourceName",
                  "externalId",
                ],
                fields: Object.keys(values),
                transaction,
              });
            }
          }
        );
      }

      // A source can be used for stale-record checks only
      // after its fetch, validation and database operation
      // have all completed successfully.
      if (completeSnapshot) {
        successfulSnapshotSources.push(sourceName);
      }

      results.push({
        sourceName,
        processed: normalizedRecords.length,
        completeSnapshot,
      });
    } catch (error) {
      // A failed provider does not stop other providers
      // from being processed.
      //
      // It is also excluded from stale-record expiry.
      results.push({
        sourceName,
        processed: 0,
        completeSnapshot: false,
        error:
          error.message ||
          "Opportunity source failed",
      });
    }
  }

  return {
    processed: results.reduce(
      (total, result) =>
        total + result.processed,
      0
    ),

    sources: results,

    successfulSnapshotSources,
  };
};

// Run the complete opportunity aggregation process.
export const runOpportunityAggregation = async () => {
  const aggregation = await aggregateOpportunities(
    getOpportunitySources()
  );

  // Expire passed deadlines for all opportunity sources.
  //
  // Only expire stale aggregated listings belonging to
  // providers that returned successful complete snapshots.
  const freshness = await expireStaleOpportunities({
    sourceNames:
      aggregation.successfulSnapshotSources,
  });

  return {
    processed: aggregation.processed,

    sources: aggregation.sources,

    expired: freshness.expired,

    expiry: {
      expiredByDeadline: freshness.expiredByDeadline,
      expiredAsStale: freshness.expiredAsStale,
    },
  };
};
