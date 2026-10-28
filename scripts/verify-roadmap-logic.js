import assert from "node:assert/strict";
import { validationResult } from "express-validator";
import sequelize from "../src/config/database.js";
import "../src/models/index.js";
import Roadmap from "../src/models/roadmap.model.js";
import RoadmapTask from "../src/models/roadmap-task.model.js";
import SkillGap from "../src/models/skillgap.model.js";
import * as roadmapService from "../src/services/roadmap.service.js";
import roadmapRoutes from "../src/routes/roadmap.routes.js";
import { createRoadmapTaskRules } from "../src/validators/roadmap.validator.js";
import { protect } from "../src/middleware/auth.middleware.js";

const originals = {
  roadmapFindOne: Roadmap.findOne,
  taskFindOne: RoadmapTask.findOne,
  taskFindByPk: RoadmapTask.findByPk,
  taskMax: RoadmapTask.max,
  taskCreate: RoadmapTask.create,
  skillGapFindOne: SkillGap.findOne,
};

const ownerId = "user-a";
const otherUserId = "user-b";
const gapId = "gap-a";
const roadmapId = "roadmap-a";
const taskId = "task-a";
const skillGap = {
  id: gapId,
  userId: ownerId,
  targetJobTitle: "Backend Engineer",
  currentSkills: ["javascript"],
  requiredSkills: ["javascript", "postgresql"],
  missingSkills: ["postgresql"],
};
const roadmap = {
  id: roadmapId,
  userId: ownerId,
  skillGapId: gapId,
  update: async function (values) { Object.assign(this, values); return this; },
  destroy: async function () { this.destroyed = true; },
};
const task = {
  id: taskId,
  roadmapId,
  phase: 30,
  status: "todo",
  completedAt: null,
  update: async function (values) { Object.assign(this, values); return this; },
  destroy: async function () { this.destroyed = true; },
};

const expectStatusError = async (promise, statusCode) => {
  await assert.rejects(promise, (error) => error.statusCode === statusCode);
};

try {
  Roadmap.findOne = async ({ where }) =>
    where.id === roadmap.id && where.userId === roadmap.userId ? roadmap : null;
  RoadmapTask.findOne = async ({ where }) =>
    where.id === task.id && where.roadmapId === task.roadmapId ? task : null;
  RoadmapTask.findByPk = async (id) => (id === task.id ? task : null);
  RoadmapTask.max = async () => 0;
  RoadmapTask.create = async (values) => ({ id: "new-task", ...values });
  SkillGap.findOne = async ({ where }) =>
    where.id === skillGap.id && where.userId === skillGap.userId ? skillGap : null;

  assert.equal((await roadmapService.getRoadmap(ownerId, roadmapId)).id, roadmapId);
  await expectStatusError(roadmapService.getRoadmap(otherUserId, roadmapId), 404);
  await expectStatusError(
    roadmapService.updateRoadmap(otherUserId, roadmapId, { title: "Changed" }),
    404,
  );
  await expectStatusError(
    roadmapService.deleteRoadmap(otherUserId, roadmapId),
    404,
  );
  await expectStatusError(
    roadmapService.deleteRoadmapTask(otherUserId, roadmapId, taskId),
    404,
  );
  await expectStatusError(
    roadmapService.createRoadmapTask(otherUserId, roadmapId, { phase: 30 }),
    404,
  );

  const createdTask = await roadmapService.createRoadmapTask(ownerId, roadmapId, {
    phase: 30,
    title: "Practice SQL joins",
    description: "Complete a small exercise using PostgreSQL joins.",
    taskType: "practice",
    skill: "postgresql",
  });
  assert.equal(createdTask.position, 1);
  assert.equal(createdTask.roadmapId, roadmapId);
  await expectStatusError(
    roadmapService.createRoadmapTask(ownerId, roadmapId, {
      phase: 15,
      title: "Invalid phase",
      description: "Must be rejected.",
      taskType: "practice",
    }),
    422,
  );
  await expectStatusError(
    roadmapService.updateRoadmapTask(ownerId, roadmapId, taskId, { phase: 15 }),
    422,
  );
  await expectStatusError(
    roadmapService.updateRoadmapTask(otherUserId, roadmapId, taskId, { title: "No access" }),
    404,
  );
  await expectStatusError(
    roadmapService.createRoadmapTask(ownerId, roadmapId, {
      phase: 30,
      title: "Unknown skill",
      description: "Must be rejected.",
      taskType: "practice",
      skill: "rust",
    }),
    422,
  );

  await roadmapService.setTaskStatus(ownerId, taskId, "done");
  assert.equal(task.status, "done");
  assert.ok(task.completedAt instanceof Date);
  const completionTime = task.completedAt;
  await roadmapService.setTaskStatus(ownerId, taskId, "in_progress");
  assert.equal(task.completedAt, null);
  await roadmapService.setTaskStatus(ownerId, taskId, "done");
  assert.ok(task.completedAt instanceof Date);
  assert.notEqual(task.completedAt, null);
  assert.ok(completionTime instanceof Date);
  await expectStatusError(roadmapService.setTaskStatus(otherUserId, taskId, "done"), 404);
  await expectStatusError(roadmapService.generateRoadmap(otherUserId, gapId), 404);
  await expectStatusError(roadmapService.generateRoadmap(ownerId, gapId), 503);

  const runTaskValidation = async (phase) => {
    const req = {
      params: { id: "00000000-0000-4000-8000-000000000000" },
      body: {
        phase,
        title: "Practice SQL joins",
        description: "Complete a small exercise.",
        taskType: "practice",
      },
    };
    await Promise.all(createRoadmapTaskRules.map((rule) => rule.run(req)));
    return validationResult(req);
  };
  assert.equal((await runTaskValidation(30)).isEmpty(), true);
  assert.equal((await runTaskValidation(15)).isEmpty(), false);

  const routeLayers = roadmapRoutes.stack.filter((layer) => layer.route);
  assert.equal(roadmapRoutes.stack[0].handle, protect, "all routes are behind protect");
  assert.equal(routeLayers.length, 8, "all eight roadmap endpoints are registered");
  await roadmapService.deleteRoadmapTask(ownerId, roadmapId, taskId);
  assert.equal(task.destroyed, true);

  process.stdout.write("PASS: roadmap ownership, validators, protected route registration, task timestamps, and deferred generation\n");
} finally {
  Roadmap.findOne = originals.roadmapFindOne;
  RoadmapTask.findOne = originals.taskFindOne;
  RoadmapTask.findByPk = originals.taskFindByPk;
  RoadmapTask.max = originals.taskMax;
  RoadmapTask.create = originals.taskCreate;
  SkillGap.findOne = originals.skillGapFindOne;
  await sequelize.close();
}
