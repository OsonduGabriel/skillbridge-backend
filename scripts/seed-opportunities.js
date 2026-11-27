
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

// Convert workbook opportunity types into model-supported values.
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

// Accept only recognized work modes.
const normalizeWorkMode = (value) => {
  const mode = String(value || "").trim().toLowerCase();

  if (mode.includes("remote")) {
    return "remote";
  }

  if (mode.includes("hybrid")) {
    return "hybrid";
  }

  if (
    mode.includes("onsite") ||
    mode.includes("on-site") ||
    mode.includes("office")
  ) {
    return "onsite";
  }

  throw new Error(
    `Unsupported opportunity work mode: "${value}"`,
  );
};

// Normalize workbook verification statuses.
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

// Validate that an application link is a valid HTTP(S) URL.
const validateApplicationUrl = (value, externalId) => {
  const applicationUrl = String(value || "").trim();

  try {
    const url = new URL(applicationUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error(
      `Opportunity ${externalId} has an invalid application URL.`,
    );
  }

  return applicationUrl;
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

  const applicationUrl = validateApplicationUrl(
    row.apply_link,
    externalId,
  );

  return {
    title,
    company,
    description,

    type: normalizeType(row.opportunity_type),

    category: String(row.sector || "").trim() || null,

    // Use a location column if the workbook contains one.
    location:
      String(
        row.location ||
        row.job_location ||
        "",
      ).trim() || null,

    workMode: normalizeWorkMode(row.location_type),

    applicationUrl,

    // The current workbook does not provide a deadline.
    deadline: null,

    requiredSkills: parseSkills(row.required_skills),

    preferredSkills: [],

    status: normalizeStatus(row.verification_status),

    // Seed records are separate from live aggregated records.
    source: "seed",

    sourceName: SOURCE_NAME,
    externalId,

    lastSeenAt: null,
  };
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

    // Read worksheet rows.
    const sheetRows = [];

    worksheet.eachRow(
      { includeEmpty: true },
      (row) => {
        const values = [];

        for (
          let column = 1;
          column <= worksheet.columnCount;
          column++
        ) {
          values.push(row.getCell(column).text ?? "");
        }

        sheetRows.push(values);
      },
    );

    // Locate the header row.
    const headerRowIndex = sheetRows.findIndex(
      (row) =>
        row.some(
          (cell) =>
            String(cell).trim().toLowerCase() === "job_id",
        ),
    );

    if (headerRowIndex === -1) {
      throw new Error(
        "Could not find the job_id column.",
      );
    }

    const headers = sheetRows[headerRowIndex].map(
      (header) => String(header).trim(),
    );

    // Convert worksheet rows into JavaScript objects.
    const rows = sheetRows
      .slice(headerRowIndex + 1)
      .filter((values) =>
        values.some(
          (value) => String(value).trim() !== "",
        ),
      )
      .map((values) => {
        const row = {};

        headers.forEach((header, index) => {
          if (header) {
            row[header] = values[index] ?? "";
          }
        });

        return row;
      });

    if (!rows.length) {
      throw new Error(
        "The opportunity workbook contains no records.",
      );
    }

    console.log(
      `Found ${rows.length} opportunity records.`,
    );

    // Validate and map all records before writing to the database.
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
