import { Op } from "sequelize";
import Opportunity from "../models/opportunity.model.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeSkills = (list = []) => [
  ...new Set(list.map((skill) => skill.trim().toLowerCase()).filter(Boolean)),
];

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

export const getOpportunityById = (id) => Opportunity.findByPk(id);

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
    requiredSkills: normalizeSkills(payload.requiredSkills),
    preferredSkills: normalizeSkills(payload.preferredSkills),
  });
};

export const updateOpportunity = async (id, payload) => {
  const opportunity = await Opportunity.findByPk(id);
  if (!opportunity) throw httpError(404, "Opportunity not found");

  const changes = Object.fromEntries(
    UPDATABLE_FIELDS.filter((field) => payload[field] !== undefined).map(
      (field) => [field, payload[field]],
    ),
  );

  if (payload.requiredSkills !== undefined) {
    changes.requiredSkills = normalizeSkills(payload.requiredSkills);
  }
  if (payload.preferredSkills !== undefined) {
    changes.preferredSkills = normalizeSkills(payload.preferredSkills);
  }

  return opportunity.update(changes);
};

export const deleteOpportunity = async (id) => {
  const opportunity = await Opportunity.findByPk(id);
  if (!opportunity) throw httpError(404, "Opportunity not found");
  await opportunity.destroy();
};

export const expireStaleOpportunities = async ({ now = new Date() } = {}) => {
  const configuredDays = Number.parseInt(
    process.env.OPPORTUNITY_STALE_AFTER_DAYS ?? "14",
    10,
  );
  const staleAfterDays =
    Number.isInteger(configuredDays) && configuredDays >= 0
      ? configuredDays
      : 14;
  const staleBefore = new Date(
    now.getTime() - staleAfterDays * 24 * 60 * 60 * 1000,
  );

  const [expired] = await Opportunity.update(
    { status: "expired" },
    {
      where: {
        status: "active",
        [Op.or]: [
          { deadline: { [Op.lt]: now } },
          {
            source: "aggregated",
            lastSeenAt: { [Op.lt]: staleBefore },
          },
        ],
      },
    },
  );

  return { expired };
};

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
}) => {
  const conditions = [{ status }];

  if (status === "active") {
    conditions.push({
      [Op.or]: [{ deadline: null }, { deadline: { [Op.gte]: new Date() } }],
    });
  }
  if (q) {
    conditions.push({
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { company: { [Op.iLike]: `%${q}%` } },
      ],
    });
  }
  if (type) conditions.push({ type });
  if (workMode) conditions.push({ workMode });
  if (category) conditions.push({ category: { [Op.iLike]: category } });
  if (location) conditions.push({ location: { [Op.iLike]: `%${location}%` } });

  if (skill) {
    const [needle] = normalizeSkills([skill]);
    if (needle) {
      conditions.push({
        [Op.or]: [
          { requiredSkills: { [Op.contains]: [needle] } },
          { preferredSkills: { [Op.contains]: [needle] } },
        ],
      });
    }
  }

  const { rows, count } = await Opportunity.findAndCountAll({
    where: { [Op.and]: conditions },
    order: [
      ["deadline", "ASC NULLS LAST"],
      ["createdAt", "DESC"],
    ],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};
