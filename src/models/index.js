import User from "./user.model.js";
import Roadmap from "./roadmap.model.js";
import RoadmapTask from "./roadmap-task.model.js";
import SkillGap from "./skillgap.model.js";
import CV from "./cv.model.js";
import CVAnalysis from "./cv.analysis.model.js";
import Matching from "./matching.model.js";
import Opportunity from "./opportunity.model.js";

User.hasMany(Roadmap, { as: "roadmaps", foreignKey: "userId" });
Roadmap.belongsTo(User, { as: "owner", foreignKey: "userId" });
Roadmap.hasMany(RoadmapTask, {
  as: "tasks",
  foreignKey: "roadmapId",
  onDelete: "CASCADE",
  hooks: true,
});
RoadmapTask.belongsTo(Roadmap, { as: "roadmap", foreignKey: "roadmapId" });
SkillGap.hasMany(Roadmap, { as: "roadmaps", foreignKey: "skillGapId" });
Roadmap.belongsTo(SkillGap, { as: "skillGap", foreignKey: "skillGapId" });



// User and CV
User.hasMany(CV, {
  foreignKey: "userId",
  as: "cvs",
});

CV.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// CV and CV Analysis
CV.hasMany(CVAnalysis, {
  foreignKey: "cvId",
  as: "analyses",
});

CVAnalysis.belongsTo(CV, {
  foreignKey: "cvId",
  as: "cv",
});

// User and Skill Gap Analysis
User.hasMany(SkillGap, {
  foreignKey: "userId",
  as: "skillGaps",
});

SkillGap.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// CV and Skill Gap Analysis
CV.hasMany(SkillGap, {
  foreignKey: "cvId",
  as: "skillGaps",
});

SkillGap.belongsTo(CV, {
  foreignKey: "cvId",
  as: "cv",
});

//Matching and opportunity
Matching.belongsTo(Opportunity, {
  foreignKey: "opportunityId",
  as: "opportunity",
});

Opportunity.hasMany(Matching, {
  foreignKey: "opportunityId",
  as: "matches",
});

// User and Career Matching
User.hasMany(Matching, {
  foreignKey: "userId",
  as: "careerMatches",
});

Matching.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export {
  User,
  CV,
  CVAnalysis,
  SkillGap,
  Matching,
  Opportunity,
};