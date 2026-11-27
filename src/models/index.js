
import User from "./user.model.js";
import Roadmap from "./roadmap.model.js";
import RoadmapTask from "./roadmap-task.model.js";
import SkillGap from "./skillgap.model.js";
import CV from "./cv.model.js";
import CVAnalysis from "./cv.analysis.model.js";
import Matching from "./matching.model.js";
import Opportunity from "./opportunity.model.js";
import Recommendation from "./recommendation.model.js";
import Course from "./course.model.js";
import CourseModule from "./course-module.model.js";
import Lesson from "./lesson.model.js";
import Enrollment from "./enrollment.model.js";
import LessonProgress from "./lesson-progress.model.js";
import Certification from "./certification.model.js";
import UserCertification from "./user-certification.model.js";

// ==========================================
// USER AND ROADMAP RELATIONSHIPS
// ==========================================

User.hasMany(Roadmap, {
  as: "roadmaps",
  foreignKey: "userId",
});

Roadmap.belongsTo(User, {
  as: "owner",
  foreignKey: "userId",
});

// ==========================================
// ROADMAP AND ROADMAP TASK RELATIONSHIPS
// ==========================================

Roadmap.hasMany(RoadmapTask, {
  as: "tasks",
  foreignKey: "roadmapId",
  onDelete: "CASCADE",
  hooks: true,
});

RoadmapTask.belongsTo(Roadmap, {
  as: "roadmap",
  foreignKey: "roadmapId",
});

// ==========================================
// SKILL GAP AND ROADMAP RELATIONSHIPS
// ==========================================

SkillGap.hasMany(Roadmap, {
  as: "roadmaps",
  foreignKey: "skillGapId",
});

Roadmap.belongsTo(SkillGap, {
  as: "skillGap",
  foreignKey: "skillGapId",
});

// ==========================================
// ROADMAP TASK AND RECOMMENDATION
// ==========================================

RoadmapTask.belongsTo(Recommendation, {
  foreignKey: "recommendationId",
  as: "recommendation",
});

Recommendation.hasMany(RoadmapTask, {
  foreignKey: "recommendationId",
  as: "roadmapTasks",
});

// ==========================================
// USER AND CV RELATIONSHIPS
// ==========================================

User.hasMany(CV, {
  foreignKey: "userId",
  as: "cvs",
});

CV.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ==========================================
// CV AND CV ANALYSIS RELATIONSHIPS
// ==========================================

CV.hasMany(CVAnalysis, {
  foreignKey: "cvId",
  as: "analyses",
});

CVAnalysis.belongsTo(CV, {
  foreignKey: "cvId",
  as: "cv",
});

// ==========================================
// USER AND SKILL GAP RELATIONSHIPS
// ==========================================

User.hasMany(SkillGap, {
  foreignKey: "userId",
  as: "skillGaps",
});

SkillGap.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ==========================================
// CV AND SKILL GAP RELATIONSHIPS
// ==========================================

CV.hasMany(SkillGap, {
  foreignKey: "cvId",
  as: "skillGaps",
});

SkillGap.belongsTo(CV, {
  foreignKey: "cvId",
  as: "cv",
});

// ==========================================
// MATCHING AND OPPORTUNITY RELATIONSHIPS
// ==========================================

Matching.belongsTo(Opportunity, {
  foreignKey: "opportunityId",
  as: "opportunity",
});

Opportunity.hasMany(Matching, {
  foreignKey: "opportunityId",
  as: "matches",
});

// ==========================================
// USER AND CAREER MATCHING RELATIONSHIPS
// ==========================================

User.hasMany(Matching, {
  foreignKey: "userId",
  as: "careerMatches",
});

Matching.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ==========================================
// MODEL EXPORTS
// ==========================================

export {
  User,
  Roadmap,
  RoadmapTask,
  SkillGap,
  CV,
  CVAnalysis,
  Matching,
  Opportunity,
  Recommendation,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  LessonProgress,
  Certification,
  UserCertification,
};
