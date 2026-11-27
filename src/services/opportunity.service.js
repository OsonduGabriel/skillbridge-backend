
import { Op } from "sequelize";
import Opportunity from "../models/opportunity.model.js";

// Create an error with an HTTP status code.
const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Normalize skill names to handle common variations.
const normalizeSkill = (skill) => {
  if (typeof skill !== "string") {
    return "";
  }

  const normalized = skill
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");

  const aliases = {
    express: "expressjs",
    expressjs: "expressjs",

    react: "reactjs",
    reactjs: "reactjs",

    node: "nodejs",
    nodejs: "nodejs",

    postgres: "postgresql",
    postgresql: "postgresql",

    js: "javascript",
    javascript: "javascript",

    html5: "html",
    html: "html",

    css3: "css",
    css: "css",
  };

  return aliases[normalized] || normalized;
};

// Validate and normalize a list of skills.
const normalizeSkills = (list = []) => {
  if (list === null || list === undefined) {
    return [];
  }

  if (!Array.isArray(list)) {
    throw httpError(400, "Skills must be provided as an array.");
  }

  return [
    ...new Set(
      list
        .map(normalizeSkill)
        .filter(Boolean)
    ),
  ];
};

const UPDATABLE_FIELDS = [
  "title",
  "company",
  "description",
  "type",
  "category",
  "location",
  "workMode",
  "applicationUrl",
  "deadline",
  "status",
];

// Retrieve an opportunity by its ID.
export const getOpportunityById = async (id) => {
  return Opportunity.findByPk(id);
};

// Create a new opportunity.
export const createOpportunity = async (payload) => {
  const {
    title,
    company,
    description,
    type,
    category,
    location,
    workMode,
    applicationUrl,
    deadline,
  } = payload;

  return Opportunity.create({
    title,
    company,
    description,
    type,
    category,
    location,
    workMode,
    applicationUrl,
    deadline,

    requiredSkills: normalizeSkills(
      payload.requiredSkills
    ),

    preferredSkills: normalizeSkills(
      payload.preferredSkills
    ),
  });
};

// Update an existing opportunity.
export const updateOpportunity = async (id, payload) => {
  const opportunity = await Opportunity.findByPk(id);

  if (!opportunity) {
    throw httpError(404, "Opportunity not found");
  }

  const changes = Object.fromEntries(
    UPDATABLE_FIELDS
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]])
  );

  if (payload.requiredSkills !== undefined) {
    changes.requiredSkills = normalizeSkills(
      payload.requiredSkills
    );
  }

  if (payload.preferredSkills !== undefined) {
    changes.preferredSkills = normalizeSkills(
      payload.preferredSkills
    );
  }

  return opportunity.update(changes);
};

// Delete an opportunity.
export const deleteOpportunity = async (id) => {
  const opportunity = await Opportunity.findByPk(id);

  if (!opportunity) {
    throw httpError(404, "Opportunity not found");
  }

  await opportunity.destroy();
};

// Expire opportunities whose application deadlines have passed.
//
// Stale aggregated opportunities are handled separately.
// They are only checked for sources that successfully returned
// a complete snapshot during the latest aggregation run.
export const expireStaleOpportunities = async ({
  now = new Date(),
  sourceNames = [],
} = {}) => {
  const configuredDays = Number.parseInt(
    process.env.OPPORTUNITY_STALE_AFTER_DAYS ?? "14",
    10
  );

  const staleAfterDays =
    Number.isInteger(configuredDays) && configuredDays >= 1
      ? configuredDays
      : 14;

  const staleBefore = new Date(
    now.getTime() -
    staleAfterDays * 24 * 60 * 60 * 1000
  );

  // First, expire opportunities whose application deadlines
  // have passed. This applies to seed, manual and aggregated records.
  const [expiredByDeadline] = await Opportunity.update(
    {
      status: "expired",
    },
    {
      where: {
        status: "active",
        deadline: {
          [Op.lt]: now,
        },
      },
    }
  );

  let expiredAsStale = 0;

  // Only check stale records for providers that successfully
  // returned a complete snapshot.
  //
  // A failed provider request must never cause its records
  // to be expired.
  const validSourceNames = [
    ...new Set(
      sourceNames.filter(
        (name) =>
          typeof name === "string" &&
          name.trim()
      ).map((name) => name.trim())
    ),
  ];

  if (validSourceNames.length > 0) {
    const [staleCount] = await Opportunity.update(
      {
        status: "expired",
      },
      {
        where: {
          status: "active",
          source: "aggregated",
          sourceName: {
            [Op.in]: validSourceNames,
          },
          lastSeenAt: {
            [Op.lt]: staleBefore,
          },
          [Op.or]: [
            { deadline: null },
            { deadline: { [Op.gte]: now } },
          ],
        },
      }
    );

    expiredAsStale = staleCount;
  }

  return {
    expired: expiredByDeadline + expiredAsStale,
    expiredByDeadline,
    expiredAsStale,
  };
};

// Check whether an opportunity contains the requested skill.
const opportunityHasSkill = (
  opportunity,
  requestedSkill
) => {
  const requiredSkills = normalizeSkills(
    opportunity.requiredSkills
  );

  const preferredSkills = normalizeSkills(
    opportunity.preferredSkills
  );

  return (
    requiredSkills.includes(requestedSkill) ||
    preferredSkills.includes(requestedSkill)
  );
};

// Retrieve opportunities with filtering and pagination.
export const listOpportunities = async ({
  page = 1,
  limit = 10,
  q,
  type,
  category,
  location,
  workMode,
  skill,
  status = "active",
} = {}) => {
  // Validate pagination values.
  const currentPage = Math.max(
    1,
    Number.parseInt(page, 10) || 1
  );

  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 10)
  );

  const conditions = [
    { status },
  ];

  // Exclude opportunities whose application deadlines have passed.
  if (status === "active") {
    conditions.push({
      [Op.or]: [
        { deadline: null },
        { deadline: { [Op.gte]: new Date() } },
      ],
    });
  }

  // Search opportunity title and company.
  if (typeof q === "string" && q.trim()) {
    const searchTerm = q.trim();

    conditions.push({
      [Op.or]: [
        {
          title: {
            [Op.iLike]: `%${searchTerm}%`,
          },
        },
        {
          company: {
            [Op.iLike]: `%${searchTerm}%`,
          },
        },
      ],
    });
  }

  if (type) {
    conditions.push({ type });
  }

  if (workMode) {
    conditions.push({ workMode });
  }

  if (typeof category === "string" && category.trim()) {
    conditions.push({
      category: {
        [Op.iLike]: category.trim(),
      },
    });
  }

  if (typeof location === "string" && location.trim()) {
    conditions.push({
      location: {
        [Op.iLike]: `%${location.trim()}%`,
      },
    });
  }

  const where = {
    [Op.and]: conditions,
  };

  const offset = (currentPage - 1) * pageSize;

  let rows;
  let count;

  if (typeof skill === "string" && skill.trim()) {
    // Normalize the requested skill.
    const requestedSkill = normalizeSkill(skill);

    // Fetch opportunities matching the other filters first.
    // Skill matching is performed in JavaScript so aliases,
    // spacing and capitalization are handled consistently.
    const opportunities = await Opportunity.findAll({
      where,
      order: [
        ["deadline", "ASC NULLS LAST"],
        ["createdAt", "DESC"],
      ],
    });

    // Filter opportunities using normalized skill names.
    const filteredOpportunities = opportunities.filter(
      (opportunity) =>
        requestedSkill &&
        opportunityHasSkill(
          opportunity,
          requestedSkill
        )
    );

    count = filteredOpportunities.length;

    // Apply pagination after skill filtering.
    rows = filteredOpportunities.slice(
      offset,
      offset + pageSize
    );
  } else {
    // Use database pagination when no skill filter is supplied.
    const result = await Opportunity.findAndCountAll({
      where,
      order: [
        ["deadline", "ASC NULLS LAST"],
        ["createdAt", "DESC"],
      ],
      limit: pageSize,
      offset,
    });

    rows = result.rows;
    count = result.count;
  }

  return {
    items: rows,

    pagination: {
      page: currentPage,
      limit: pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    },
  };
};
