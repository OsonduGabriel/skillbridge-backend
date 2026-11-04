
import XLSX from "xlsx";
import { fileURLToPath } from "url";

import sequelize from "../src/config/database.js";
import Opportunity from "../src/models/opportunity.model.js";

// Path to the Excel file.
const workbookPath = fileURLToPath(
  new URL("../data/opportunities.xlsx", import.meta.url)
);

// Dataset information.
const SHEET_NAME = "50 Opportunities Dataset";
const SOURCE_NAME = "AI Team Dataset";

// Convert the skills in Excel into an array.
const parseSkills = (value) => {
  if (!value) return [];

  return String(value)
    .split(/[,;\n]/)
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
};

// Convert Excel opportunity types into values accepted by our model.
const normalizeType = (value) => {
  const type = String(value || "").trim().toLowerCase();

  if (type.includes("full-time") || type === "job") {
    return "job";
  }

  if (type.includes("internship") || type.includes("practical project")) {
    return "internship";
  }

  if (type.includes("contract") || type.includes("project")) {
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

  throw new Error(`Unsupported opportunity type: ${value}`);
};

// Determine the work mode from the Excel location_type column.
const normalizeWorkMode = (value) => {
  const location = String(value || "").trim().toLowerCase();

  if (location.includes("remote")) {
    return "remote";
  }

  if (location.includes("hybrid")) {
    return "hybrid";
  }

  return "onsite";
};

// Convert verification status into our model's status values.
const normalizeStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();

  if (status.includes("active")) {
    return "active";
  }

  if (status.includes("expired")) {
    return "expired";
  }

  return "closed";
};

// Convert an Excel row into an Opportunity record.
const mapOpportunity = (row) => {
  const externalId = String(row.job_id || "").trim();

  if (!externalId) {
    throw new Error("An opportunity is missing its job_id.");
  }

  const title = String(row.job_title || "").trim();
  const company = String(row.company || "").trim();
  const description = String(
    row.opportunity_description || ""
  ).trim();

  const applicationUrl = String(row.apply_link || "").trim();

  if (!title || !company || !description || !applicationUrl) {
    throw new Error(
      `Opportunity ${externalId} is missing a required field.`
    );
  }

  return {
    title,
    company,
    description,

    type: normalizeType(row.opportunity_type),

    category: String(row.sector || "").trim() || null,

    // The workbook has location_type but no separate location column.
    location: null,

    workMode: normalizeWorkMode(row.location_type),

    applicationUrl,

    // The workbook does not provide an application deadline.
    deadline: null,

    requiredSkills: parseSkills(row.required_skills),

    // The workbook does not provide preferred skills.
    preferredSkills: [],

    status: normalizeStatus(row.verification_status),

    source: "aggregated",
    sourceName: SOURCE_NAME,
    externalId,

    lastSeenAt: new Date(),
  };
};

// Main seeder function.
const seedOpportunities = async () => {
  let transaction;

  try {
    console.log("Connecting to database...");

    await sequelize.authenticate();

    console.log("Reading opportunities Excel workbook...");

    // Read the Excel workbook.
    const workbook = XLSX.readFile(workbookPath);

    // Check that the expected worksheet exists.
    const worksheet = workbook.Sheets[SHEET_NAME];

    if (!worksheet) {
      throw new Error(
        `Worksheet "${SHEET_NAME}" was not found in the Excel file.`
      );
    }

    // Read all worksheet rows as arrays.
    const sheetRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    });

    // Find the actual header row using the job_id column.
    const headerRowIndex = sheetRows.findIndex((row) =>
      row.some(
        (cell) => String(cell).trim().toLowerCase() === "job_id"
      )
    );

    if (headerRowIndex === -1) {
      throw new Error(
        "Could not find the job_id column in the Excel file."
      );
    }

    // Extract and clean the column headers.
    const headers = sheetRows[headerRowIndex].map((header) =>
      String(header).trim()
    );

    // Convert the remaining worksheet rows into objects.
    const rows = sheetRows
      .slice(headerRowIndex + 1)
      .filter((values) =>
        values.some((value) => String(value).trim() !== "")
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

    console.log(`Found ${rows.length} opportunity records.`);

    // Verify the expected number of records.
    if (rows.length !== 50) {
      throw new Error(
        `Expected 50 opportunities but found ${rows.length}.`
      );
    }

    // Confirm that the first record was read correctly.
    console.log("First opportunity:", rows[0]);

    if (rows[0]?.job_id !== "OPP-2026-001") {
      throw new Error("The first opportunity ID is incorrect.");
    }

    // Map all Excel records into our database structure.
    const opportunities = rows.map(mapOpportunity);

    console.log("All opportunity records mapped successfully.");
    console.log("Starting database import...");

    // Start a transaction so the import can be rolled back if needed.
    transaction = await sequelize.transaction();

    let createdCount = 0;
    let updatedCount = 0;

    for (const opportunity of opportunities) {
      // Check whether this opportunity already exists.
      const existingOpportunity = await Opportunity.findOne({
        where: {
          sourceName: opportunity.sourceName,
          externalId: opportunity.externalId,
        },
        transaction,
      });

      if (existingOpportunity) {
        // Update an existing opportunity instead of creating a duplicate.
        await existingOpportunity.update(opportunity, {
          transaction,
        });

        updatedCount++;
      } else {
        // Create a new opportunity.
        await Opportunity.create(opportunity, {
          transaction,
        });

        createdCount++;
      }
    }

    // Save all changes to the database.
    await transaction.commit();
    transaction = null;

    console.log("-----------------------------------");
    console.log("Opportunity import completed!");
    console.log(`Total records processed: ${opportunities.length}`);
    console.log(`New opportunities created: ${createdCount}`);
    console.log(`Existing opportunities updated: ${updatedCount}`);
    console.log("-----------------------------------");
  } catch (error) {
    // Undo database changes if anything goes wrong.
    if (transaction) {
      await transaction.rollback();
    }

    console.error("Opportunity import failed:", error.message);

    process.exitCode = 1;
  } finally {
    // Close the database connection.
    await sequelize.close();
  }
};

seedOpportunities();
