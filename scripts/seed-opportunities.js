
import ExcelJS from "exceljs";
import { fileURLToPath } from "url";

import sequelize from "../src/config/database.js";
import Opportunity from "../src/models/opportunity.model.js";

const workbookPath = fileURLToPath(
  new URL("../data/opportunities.xlsx", import.meta.url),
);

const SHEET_NAME = "50 Opportunities Dataset";
const SOURCE_NAME = "AI Team Dataset";

// Convert comma-, semicolon- or newline-separated skills into an array.
const parseSkills = (value) => {
  if (!value) return [];

  return [
    ...new Set(
      String(value)
        .split(/[,;\n]/)
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
};

// Normalize workbook opportunity types into model-supported values.
const normalizeType = (value) => {
  const type = String(value || "").trim().toLowerCase();

  if (type.includes("full-time") || type === "job") {
    return "job";
  }

  if (
    type.includes("internship") ||
    type.includes("practical project")
  ) {
    return "internship";
  }

  if (
    type.includes("contract") ||
    type.includes("project")
  ) {
    return "freelance";
  }

  if (type.includes("graduate")) {
    return "graduate_program";
  }

  if (type.includes("fellowship")) {
    return "fellowship";
  }

  const allowedTypes = [
    "internship",
    "job",
    "graduate_program",
    "fellowship",
    "freelance",
  ];

  if (allowedTypes.includes(type)) {
    return type;
  }

  throw new Error(
    `Unsupported opportunity type: "${value}"`,
  );
};

// Extract a definite work arrangement where possible.
const normalizeWorkMode = (value) => {
  const mode = String(value || "").trim().toLowerCase();

  if (mode.startsWith("remote")) {
    return "remote";
  }

  if (mode.startsWith("hybrid")) {
    return "hybrid";
  }

  if (
    mode.startsWith("on-site") ||
    mode.startsWith("onsite")
  ) {
    return "onsite";
  }

  if (mode.startsWith("field / hybrid")) {
    return "hybrid";
  }

  // These values do not establish one definite work arrangement.
  if (
    mode === "remote / hybrid" ||
    mode === "on-site / hybrid"
  ) {
    return null;
  }

  throw new Error(
    `Unsupported opportunity work mode: "${value}"`,
  );
};

// Extract the geographical location from location_type.
const normalizeLocation = (value) => {
  const locationType = String(value || "").trim();

  const match = locationType.match(/\(([^)]+)\)/);

  if (match) {
    return match[1].trim();
  }

  // Field / Remote (Nigeria) is already handled by the parentheses.
  // This fallback covers field-based entries without parentheses.
  if (/field\s*\/\s*remote/i.test(locationType)) {
    return "Nigeria";
  }

  return null;
};

// Normalize the workbook's availability status.
const normalizeStatus = (value) => {
  const status = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const statusMap = {
    active: "active",
    "verified active": "active",

    expired: "expired",
    "verified expired": "expired",

    closed: "closed",
    "verified closed": "closed",

    inactive: "closed",
    "verified inactive": "closed",
  };

  const normalizedStatus = statusMap[status];

  if (!normalizedStatus) {
    throw new Error(
      `Unsupported opportunity status: "${value}".`,
    );
  }

  return normalizedStatus;
};

// Preserve the original verification label.
const normalizeVerificationStatus = (value) => {
  const status = String(value || "").trim();

  return status || null;
};

// Validate and normalize an HTTP(S) URL.
const normalizeUrl = (value, fieldName, externalId) => {
  const urlValue = String(value || "").trim();

  try {
    const url = new URL(urlValue);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error(
      `Opportunity ${externalId} has an invalid ${fieldName}.`,
    );
  }

  return urlValue;
};

// Convert Excel dates or date strings into YYYY-MM-DD.
const normalizeDate = (value, fieldName, externalId) => {
  if (!value) return null;

  let date;

  if (value instanceof Date) {
    date = value;
  } else {
    const text = String(value).trim();

    // Accept YYYY-MM-DD and other date strings recognized by Date.
    date = new Date(text);
  }

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Opportunity ${externalId} has an invalid ${fieldName}: "${value}".`,
    );
  }

  return date.toISOString().slice(0, 10);
};

// Preserve the posting date as supplied by the workbook.
// Examples: October 2026, November 2026.
const normalizePostingDate = (value) => {
  const postingDate = String(value || "").trim();

  return postingDate || null;
};

// Convert a workbook row into the Opportunity model structure.
const mapOpportunity = (row) => {
  const externalId = String(row.job_id || "").trim();

  if (!externalId) {
    throw new Error(
      "An opportunity is missing its job_id.",
    );
  }

  const title = String(row.job_title || "").trim();
  const company = String(row.company || "").trim();

  const description = String(
    row.opportunity_description || "",
  ).trim();

  if (!title || !company || !description) {
    throw new Error(
      `Opportunity ${externalId} is missing a required field.`,
    );
  }

  if (title.length > 200 || company.length > 150) {
    throw new Error(
      `Opportunity ${externalId} has an overlong title or company name.`,
    );
  }

  const applicationUrl = normalizeUrl(
    row.apply_link,
    "application URL",
    externalId,
  );

  const sourceUrl = normalizeUrl(
    row.job_site_link,
    "source URL",
    externalId,
  );

  const sourcePlatform = String(
    row.source_platform || "",
  ).trim();

  if (!sourcePlatform) {
    throw new Error(
      `Opportunity ${externalId} is missing its source platform.`,
    );
  }

  return {
    title,
    company,
    description,

    type: normalizeType(row.opportunity_type),

    category: String(row.sector || "").trim() || null,

    location: normalizeLocation(row.location_type),

    workMode: normalizeWorkMode(row.location_type),

    applicationUrl,
    sourceUrl,
    sourcePlatform,

    // The workbook does not provide an application deadline.
    deadline: null,

    postingDate: normalizePostingDate(row.posting_date),

    verificationStatus: normalizeVerificationStatus(
      row.verification_status,
    ),

    verificationDate: normalizeDate(
      row.verification_date,
      "verification date",
      externalId,
    ),

    requiredSkills: parseSkills(row.required_skills),

    preferredSkills: [],

    // Availability status is separate from verification status.
    status: normalizeStatus(row.verification_status),

    source: "seed",
    sourceName: SOURCE_NAME,
    externalId,

    lastSeenAt: null,
  };
};

// Read workbook rows using the actual header positions.

const readOpportunityRows = (worksheet) => {
  let headerRowNumber = null;
  let headers = [];

  worksheet.eachRow((row, rowNumber) => {
    if (headerRowNumber !== null) return;

    const values = [];

    for (
      let column = 1;
      column <= worksheet.columnCount;
      column++
    ) {
      values.push(
        String(row.getCell(column).text || "").trim(),
      );
    }

    if (
      values.some(
        (value) => value.toLowerCase() === "job_id",
      )
    ) {
      headerRowNumber = rowNumber;
      headers = values;
    }
  });

  if (headerRowNumber === null) {
    throw new Error(
      "Could not find the job_id header row.",
    );
  }

  const requiredHeaders = [
    "job_id",
    "job_title",
    "company",
    "sector",
    "opportunity_type",
    "posting_date",
    "source_platform",
    "job_site_link",
    "verification_date",
    "location_type",
    "required_skills",
    "opportunity_description",
    "apply_link",
    "verification_status",
  ];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header),
  );

  if (missingHeaders.length) {
    throw new Error(
      `Workbook is missing required columns: ${missingHeaders.join(", ")}`,
    );
  }

  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowNumber) return;

    const record = {};

    headers.forEach((header, index) => {
      if (header) {
        record[header] = row.getCell(index + 1).text || "";
      }
    });

    const hasData = Object.values(record).some(
      (value) => String(value).trim() !== "",
    );

    if (hasData) {
      rows.push(record);
    }
  });

  return rows;
};


// Main import function.
const seedOpportunities = async () => {
  let transaction;

  try {
    console.log("Connecting to database...");

    await sequelize.authenticate();

    console.log("Reading opportunity Excel workbook...");

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(workbookPath);

    const worksheet = workbook.getWorksheet(SHEET_NAME);

    if (!worksheet) {
      throw new Error(
        `Worksheet "${SHEET_NAME}" was not found.`,
      );
    }

    const rows = readOpportunityRows(worksheet);

    if (!rows.length) {
      throw new Error(
        "The opportunity workbook contains no records.",
      );
    }

    console.log(
      `Found ${rows.length} opportunity records.`,
    );

    // Validate and map every record before writing to the database.
    const opportunities = rows.map(mapOpportunity);

    // Prevent duplicate IDs inside the same workbook.
    const externalIds = opportunities.map(
      (opportunity) => opportunity.externalId,
    );

    if (new Set(externalIds).size !== externalIds.length) {
      throw new Error(
        "The workbook contains duplicate job_id values.",
      );
    }

    console.log(
      "All opportunity records passed validation.",
    );

    console.log("Starting database import...");

    transaction = await sequelize.transaction();

    let createdCount = 0;
    let updatedCount = 0;

    for (const opportunity of opportunities) {
      const existingOpportunity = await Opportunity.findOne({
        where: {
          sourceName: opportunity.sourceName,
          externalId: opportunity.externalId,
        },
        transaction,
      });

      if (existingOpportunity) {
        await existingOpportunity.update(
          opportunity,
          { transaction },
        );

        updatedCount++;
      } else {
        await Opportunity.create(
          opportunity,
          { transaction },
        );

        createdCount++;
      }
    }

    await transaction.commit();
    transaction = null;

    console.log("-----------------------------------");
    console.log("Opportunity import completed!");
    console.log(`Total records: ${opportunities.length}`);
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log("-----------------------------------");
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    console.error(
      "Opportunity import failed:",
      error.message,
    );

    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedOpportunities();
