
import sequelize from "../config/database.js";
import Roadmap, {
  ROADMAP_STATUSES,
} from "../models/roadmap.model.js";
import RoadmapTask, {
  ROADMAP_PHASES,
  ROADMAP_TASK_STATUSES,
  ROADMAP_TASK_TYPES,
} from "../models/roadmap-task.model.js";
import { generateRoadmapWithAI } from "./ai.service.js";

const TASK_WRITABLE_FIELDS = [
  "phase",
  "position",
  "title",
  "description",
  "taskType",
  "skill",
  "recommendationId",
  "resourceUrl",
  "estimatedHours",
  "dueDate",
  "status",
];

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeSkill = (skill) => {
  if (typeof skill !== "string") return "";

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

const normalizeSkills = (skills) =>
  Array.isArray(skills)
    ? skills
        .filter((skill) => typeof skill === "string")
        .map(normalizeSkill)
        .filter(Boolean)
    : [];

const pickTaskFields = (payload) =>
  Object.fromEntries(
    TASK_WRITABLE_FIELDS
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]])
  );

const getRoadmapForUser = async (userId, roadmapId, options = {}) => {
  const roadmap = await Roadmap.findOne({
    where: {
      id: roadmapId,
      userId,
    },
    ...options,
  });

  if (!roadmap) {
    throw httpError(404, "Roadmap not found");
  }

  return roadmap;
};

const getOwnedSkillGap = async (userId, skillGapId) => {
  const SkillGap = sequelize.models.SkillGap;

  if (!SkillGap) {
    throw httpError(503, "Skill gap integration is unavailable");
  }

  const skillGap = await SkillGap.findOne({
    where: {
      id: skillGapId,
      userId,
    },
  });

  if (!skillGap) {
    throw httpError(404, "Skill gap not found");
  }

  return skillGap;
};

const assertSkillBelongsToGap = async (userId, skillGapId, skill) => {
  if (!skill) return;

  if (!skillGapId) {
    throw httpError(422, "A task skill requires a linked skill gap");
  }

  const skillGap = await getOwnedSkillGap(userId, skillGapId);

  const missingSkills = normalizeSkills(skillGap.missingSkills);

  if (!missingSkills.includes(normalizeSkill(skill))) {
    throw httpError(
      422,
      "Task skill must be in the linked skill gap's missingSkills"
    );
  }
};

const assertRecommendationExists = async (recommendationId) => {
  if (!recommendationId) return;

  const Recommendation = sequelize.models.Recommendation;

  if (!Recommendation) {
    throw httpError(503, "Recommendation integration is unavailable");
  }

  const recommendation = await Recommendation.findByPk(recommendationId);

  if (!recommendation) {
    throw httpError(404, "Recommendation not found");
  }
};

const assertTaskValues = (values, { requireFields = false } = {}) => {
  if (
    requireFields &&
    (!values.title || typeof values.title !== "string" || !values.title.trim())
  ) {
    throw httpError(422, "Task title is required");
  }

  if (
    requireFields &&
    !ROADMAP_PHASES.includes(Number(values.phase))
  ) {
    throw httpError(422, "Task phase must be 30, 60, or 90");
  }

  if (
    values.phase !== undefined &&
    !ROADMAP_PHASES.includes(Number(values.phase))
  ) {
    throw httpError(422, "Task phase must be 30, 60, or 90");
  }

  if (
    values.taskType !== undefined &&
    !ROADMAP_TASK_TYPES.includes(values.taskType)
  ) {
    throw httpError(422, "Invalid task type");
  }

  if (
    values.status !== undefined &&
    !ROADMAP_TASK_STATUSES.includes(values.status)
  ) {
    throw httpError(422, "Invalid task status");
  }

  if (
    values.estimatedHours !== undefined &&
    (!Number.isFinite(Number(values.estimatedHours)) ||
      Number(values.estimatedHours) < 0)
  ) {
    throw httpError(422, "Estimated hours must be a valid non-negative number");
  }

  if (
    values.position !== undefined &&
    (!Number.isInteger(Number(values.position)) ||
      Number(values.position) < 0)
  ) {
    throw httpError(422, "Task position must be a non-negative integer");
  }
};

const getNextTaskPosition = async (roadmapId, phase, transaction) => {
  const maxPosition = await RoadmapTask.max("position", {
    where: {
      roadmapId,
      phase,
    },
    transaction,
  });

  return maxPosition === null ? 0 : maxPosition + 1;
};

// Generate a roadmap from an existing completed skill-gap analysis.
export const generateRoadmap = async (userId, skillGapId) => {
  const skillGap = await getOwnedSkillGap(userId, skillGapId);

  if (skillGap.status !== "completed") {
    throw httpError(
      422,
      "A completed skill-gap analysis is required to generate a roadmap"
    );
  }

  // Return an existing roadmap instead of generating a duplicate.
  const existingRoadmap = await Roadmap.findOne({
    where: {
      userId,
      skillGapId,
    },
  });

  if (existingRoadmap) {
    return getRoadmap(userId, existingRoadmap.id);
  }

  if (
    typeof skillGap.targetJobTitle !== "string" ||
    !skillGap.targetJobTitle.trim()
  ) {
    throw httpError(422, "The skill-gap record has no valid target role");
  }

  const currentSkills = Array.isArray(skillGap.currentSkills)
    ? skillGap.currentSkills
    : [];

  const missingSkills = Array.isArray(skillGap.missingSkills)
    ? skillGap.missingSkills
    : [];

  // Generate the roadmap using Gemini.
  const aiResult = await generateRoadmapWithAI({
    currentSkills,
    missingSkills,
    targetRole: skillGap.targetJobTitle.slice(0, 200),
    industryFocus: skillGap.industryFocus || undefined,
    careerStage: skillGap.careerStage || undefined,
    primaryGoal: "Build a 90-day learning roadmap",
  });

  const learningRoadmap = aiResult?.learning_roadmap;
  const recommendedProjects = aiResult?.recommended_projects;

  if (
    !Array.isArray(learningRoadmap) ||
    learningRoadmap.length !== 3 ||
    !Array.isArray(recommendedProjects) ||
    recommendedProjects.length === 0
  ) {
    throw httpError(
      502,
      "AI returned an incomplete roadmap. Please try again."
    );
  }

  const missingSkillKeys = normalizeSkills(missingSkills);

  const matchMissingSkill = (candidate) => {
    const candidateKey = normalizeSkill(candidate);

    if (!candidateKey) return null;

    const index = missingSkillKeys.indexOf(candidateKey);

    return index === -1 ? null : missingSkills[index];
  };

  const tasks = [];
  const positions = {
    30: 0,
    60: 0,
    90: 0,
  };

  const addTask = (phase, task) => {
    tasks.push({
      phase,
      position: positions[phase]++,
      status: ROADMAP_TASK_STATUSES.includes("todo")
        ? "todo"
        : ROADMAP_TASK_STATUSES[0],
      ...task,
    });
  };

  // Convert the three AI learning phases into roadmap tasks.
  learningRoadmap.forEach((learningPhase, index) => {
    const phase = ROADMAP_PHASES[index];

    if (!learningPhase || !phase) {
      throw httpError(502, "AI returned an invalid learning phase");
    }

    const objectives = Array.isArray(learningPhase.learning_objectives)
      ? learningPhase.learning_objectives
      : [];

    const recommendedTopics = Array.isArray(
      learningPhase.recommended_topics
    )
      ? learningPhase.recommended_topics
      : [];

    const searchKeywords = Array.isArray(
      learningPhase.recommended_courses_or_search_keywords
    )
      ? learningPhase.recommended_courses_or_search_keywords
      : [];

    const tasksForPhase = objectives.length
      ? objectives
      : recommendedTopics;

    tasksForPhase.forEach((objective) => {
      if (typeof objective !== "string" || !objective.trim()) return;

      const description = [
        `Focus skill: ${learningPhase.focus_skill || "General learning"}`,
        `Learning objective: ${objective}`,
        `Recommended topics: ${recommendedTopics.join(", ")}`,
        `Suggested searches: ${searchKeywords.join(", ")}`,
      ].join("\n\n");

      addTask(phase, {
        title: objective.trim().slice(0, 200),
        description,
        taskType: "learn",
        skill: matchMissingSkill(learningPhase.focus_skill),
      });
    });
  });

  // Add the recommended projects to the final phase.
  recommendedProjects.forEach((project) => {
    if (
      !project ||
      typeof project.project_title !== "string" ||
      !project.project_title.trim()
    ) {
      return;
    }

    const keyFeatures = Array.isArray(project.key_features)
      ? project.key_features
      : [];

    const techStack = Array.isArray(project.tech_stack)
      ? project.tech_stack
      : [];

    const demonstratedSkills = Array.isArray(project.skills_demonstrated)
      ? project.skills_demonstrated
      : [];

    const description = [
      project.target_role_relevance || "",
      `Difficulty: ${project.difficulty_level || "Not specified"}`,
      `Key features: ${keyFeatures.join(", ")}`,
      `Tech stack: ${techStack.join(", ")}`,
      `Skills demonstrated: ${demonstratedSkills.join(", ")}`,
      `Resume bullet: ${project.resume_bullet_point || ""}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const matchingSkill =
      demonstratedSkills.map(matchMissingSkill).find(Boolean) || null;

    addTask(90, {
      title: project.project_title.trim().slice(0, 200),
      description,
      taskType: "project",
      skill: matchingSkill,
    });
  });

  if (tasks.length === 0) {
    throw httpError(
      502,
      "AI did not generate any usable roadmap tasks. Please try again."
    );
  }

  // Create the roadmap and its tasks in one database transaction.
  try {
    const roadmap = await sequelize.transaction(async (transaction) => {
      const createdRoadmap = await Roadmap.create(
        {
          userId,
          skillGapId,
          title: `90-Day ${skillGap.targetJobTitle} Learning Roadmap`.slice(
            0,
            200
          ),
          targetRole: skillGap.targetJobTitle,
          summary: `A personalized 90-day learning plan to develop ${missingSkills.join(
            ", "
          )} for the ${skillGap.targetJobTitle} role.`,
          status: "draft",
          generatedBy: "ai",
        },
        { transaction }
      );

      await RoadmapTask.bulkCreate(
        tasks.map((task) => ({
          ...task,
          roadmapId: createdRoadmap.id,
        })),
        { transaction }
      );

      return createdRoadmap;
    });

    return getRoadmap(userId, roadmap.id);
  } catch (error) {
    // Handle simultaneous requests that attempt to create the same roadmap.
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.original?.code === "23505"
    ) {
      const existingRoadmap = await Roadmap.findOne({
        where: {
          userId,
          skillGapId,
        },
      });

      if (existingRoadmap) {
        return getRoadmap(userId, existingRoadmap.id);
      }
    }

    throw error;
  }
};

// Retrieve all roadmaps belonging to a user.
export const listRoadmaps = (userId) =>
  Roadmap.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });

// Retrieve one roadmap together with its tasks.
export const getRoadmap = async (userId, roadmapId) =>
  getRoadmapForUser(userId, roadmapId, {
    include: [
      {
        model: RoadmapTask,
        as: "tasks",
        separate: true,
        order: [
          ["phase", "ASC"],
          ["position", "ASC"],
        ],
      },
    ],
  });

// Update roadmap details.
export const updateRoadmap = async (userId, roadmapId, payload) => {
  const roadmap = await getRoadmapForUser(userId, roadmapId);

  const allowedFields = [
    "title",
    "targetRole",
    "summary",
    "status",
    "startDate",
  ];

  const changes = Object.fromEntries(
    allowedFields
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]])
  );

  if (
    changes.status &&
    !ROADMAP_STATUSES.includes(changes.status)
  ) {
    throw httpError(422, "Invalid roadmap status");
  }

  await roadmap.update(changes);

  return roadmap;
};

// Delete a roadmap.
export const deleteRoadmap = async (userId, roadmapId) => {
  const roadmap = await getRoadmapForUser(userId, roadmapId);
  await roadmap.destroy();
};

// Create a task inside a roadmap.
export const createRoadmapTask = async (userId, roadmapId, payload) => {
  const roadmap = await getRoadmapForUser(userId, roadmapId);

  const values = pickTaskFields(payload);

  assertTaskValues(values, { requireFields: true });

  await assertSkillBelongsToGap(
    userId,
    roadmap.skillGapId,
    values.skill
  );

  await assertRecommendationExists(values.recommendationId);

  const position =
    values.position ??
    (await getNextTaskPosition(roadmapId, Number(values.phase)));

  return RoadmapTask.create({
    ...values,
    phase: Number(values.phase),
    position,
    roadmapId,
    completedAt:
      values.status === "done" ? new Date() : null,
  });
};

// Update a task inside a roadmap.
export const updateRoadmapTask = async (
  userId,
  roadmapId,
  taskId,
  payload
) => {
  const roadmap = await getRoadmapForUser(userId, roadmapId);

  const task = await RoadmapTask.findOne({
    where: {
      id: taskId,
      roadmapId,
    },
  });

  if (!task) {
    throw httpError(404, "Roadmap task not found");
  }

  const changes = pickTaskFields(payload);

  assertTaskValues(changes);

  if (changes.skill !== undefined) {
    await assertSkillBelongsToGap(
      userId,
      roadmap.skillGapId,
      changes.skill
    );
  }

  if (changes.recommendationId !== undefined) {
    await assertRecommendationExists(changes.recommendationId);
  }

  if (changes.phase !== undefined) {
    changes.phase = Number(changes.phase);
  }

  if (changes.status !== undefined) {
    changes.completedAt =
      changes.status === "done"
        ? task.completedAt || new Date()
        : null;
  }

  await task.update(changes);

  return task;
};

// Delete a task from a roadmap.
export const deleteRoadmapTask = async (
  userId,
  roadmapId,
  taskId
) => {
  await getRoadmapForUser(userId, roadmapId);

  const task = await RoadmapTask.findOne({
    where: {
      id: taskId,
      roadmapId,
    },
  });

  if (!task) {
    throw httpError(404, "Roadmap task not found");
  }

  await task.destroy();
};

// Update a task's status.
export const setTaskStatus = async (userId, taskId, status) => {
  if (!ROADMAP_TASK_STATUSES.includes(status)) {
    throw httpError(422, "Invalid task status");
  }

  const task = await RoadmapTask.findByPk(taskId);

  if (!task) {
    throw httpError(404, "Roadmap task not found");
  }

  await getRoadmapForUser(userId, task.roadmapId);

  await task.update({
    status,
    completedAt:
      status === "done"
        ? task.completedAt || new Date()
        : null,
  });

  return task;
};
