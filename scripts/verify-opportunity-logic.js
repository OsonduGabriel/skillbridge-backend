import assert from "node:assert/strict";
import { Op } from "sequelize";
import sequelize from "../src/config/database.js";
import Opportunity from "../src/models/opportunity.model.js";
import { expireStaleOpportunities } from "../src/services/opportunity.service.js";
import { aggregateOpportunities } from "../src/services/opportunityAggregation.service.js";
import { getOpportunitySources } from "../src/services/sources/index.js";

const originalUpdate = Opportunity.update;
const originalUpsert = Opportunity.upsert;
const originalTransaction = sequelize.transaction;
const now = new Date("2026-10-19T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

const matches = (where, row) => {
  for (const key of Reflect.ownKeys(where)) {
    const expected = where[key];
    if (key === Op.or) {
      if (!expected.some((condition) => matches(condition, row))) return false;
      continue;
    }

    if (key === Op.and) {
      if (!expected.every((condition) => matches(condition, row))) return false;
      continue;
    }

    const actual = row[key];
    if (expected && typeof expected === "object" && !(expected instanceof Date)) {
      for (const symbol of Object.getOwnPropertySymbols(expected)) {
        const operand = expected[symbol];
        if (symbol === Op.lt && !(actual != null && new Date(actual) < operand)) return false;
        if (symbol === Op.gte && !(actual != null && new Date(actual) >= operand)) return false;
        if (symbol === Op.in && !operand.includes(actual)) return false;
      }
      if (Object.hasOwn(expected, "is") && actual !== expected.is) return false;
    } else if (expected === null) {
      if (actual != null) return false;
    } else if (actual !== expected) {
      return false;
    }
  }
  return true;
};

try {
  process.env.OPPORTUNITY_STALE_AFTER_DAYS = "14";
  const staleRows = [
    { status: "active", source: "manual", deadline: new Date(now - DAY), lastSeenAt: null },
    { status: "active", source: "aggregated", deadline: null, lastSeenAt: new Date(now - 15 * DAY) },
    { status: "active", source: "manual", deadline: null, lastSeenAt: new Date(now - 30 * DAY) },
    { status: "closed", source: "manual", deadline: new Date(now - DAY), lastSeenAt: null },
  ];

  Opportunity.update = async (values, options) => {
    let count = 0;
    for (const row of staleRows) {
      if (matches(options.where, row)) {
        Object.assign(row, values);
        count += 1;
      }
    }
    return [count];
  };

  const expirationResult = await expireStaleOpportunities({ now });
  assert.deepEqual(expirationResult, { expired: 2 });
  assert.equal(staleRows[0].status, "expired", "past deadline expires");
  assert.equal(staleRows[1].status, "expired", "stale aggregated row expires");
  assert.equal(staleRows[2].status, "active", "manual row ignores lastSeenAt");
  assert.equal(staleRows[3].status, "closed", "closed row remains closed");

  const reactivationRows = [
    { sourceName: "fixture", externalId: "reactivate", status: "expired", deadline: null },
    { sourceName: "fixture", externalId: "past-deadline", status: "expired", deadline: new Date(now - DAY) },
    { sourceName: "fixture", externalId: "closed", status: "closed", deadline: null },
  ];
  let saved = 0;
  Opportunity.upsert = async (values) => {
    const row = reactivationRows.find(
      (candidate) => candidate.sourceName === values.sourceName && candidate.externalId === values.externalId,
    );
    if (!row) reactivationRows.push({ ...values, status: "active" });
    else Object.assign(row, values);
    saved += 1;
  };
  Opportunity.update = async (values, options) => {
    let count = 0;
    for (const row of reactivationRows) {
      if (matches(options.where, row)) {
        Object.assign(row, values);
        count += 1;
      }
    }
    return [count];
  };
  sequelize.transaction = async (callback) => callback({});

  const validRecord = (externalId) => ({
    externalId,
    title: "Sample role",
    company: "Example Nigeria",
    description: "Sample description",
    type: "internship",
    applicationUrl: "https://example.com/apply",
  });

  const aggregateResult = await aggregateOpportunities([
    { sourceName: "broken", fetch: async () => { throw new Error("source down"); }, normalize: (record) => record },
    { sourceName: "fixture", fetch: async () => [validRecord("reactivate"), validRecord("past-deadline"), validRecord("closed")], normalize: (record) => record },
  ]);

  assert.equal(aggregateResult.processed, 3, "successful source processed after failure");
  assert.equal(aggregateResult.sources[0].error, "source down");
  assert.equal(reactivationRows[0].status, "active", "expired seen row reactivates");
  assert.equal(reactivationRows[1].status, "expired", "expired past-deadline row stays expired");
  assert.equal(reactivationRows[2].status, "closed", "closed row never reactivates");
  assert.equal(saved, 3);

  saved = 0;
  const invalidResult = await aggregateOpportunities([
    {
      sourceName: "invalid-batch",
      fetch: async () => [validRecord("valid-first"), { ...validRecord("invalid-second"), type: "invalid" }],
      normalize: (record) => record,
    },
  ]);
  assert.equal(invalidResult.sources[0].processed, 0);
  assert.equal(saved, 0, "strict validation finishes before any source writes");

  process.env.OPPORTUNITY_SAMPLE_SOURCE = "true";
  const sampleRows = new Map();
  Opportunity.upsert = async (values) => {
    sampleRows.set(`${values.sourceName}:${values.externalId}`, values);
  };
  const sampleAdapters = getOpportunitySources();
  const firstSampleRun = await aggregateOpportunities(sampleAdapters);
  const firstRowCount = sampleRows.size;
  const secondSampleRun = await aggregateOpportunities(sampleAdapters);
  assert.equal(firstSampleRun.processed, 2);
  assert.equal(secondSampleRun.processed, 2);
  assert.equal(firstRowCount, 2);
  assert.equal(sampleRows.size, firstRowCount, "sample reruns preserve distinct row count");

  process.stdout.write("PASS: freshness, reactivation, source isolation, pre-write validation, and sample idempotency\n");
} finally {
  Opportunity.update = originalUpdate;
  Opportunity.upsert = originalUpsert;
  sequelize.transaction = originalTransaction;
  await sequelize.close();
}
