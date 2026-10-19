import User from "./user.model.js";
import Roadmap from "./roadmap.model.js";
import RoadmapTask from "./roadmap-task.model.js";
import SkillGap from "./skillgap.model.js";

User.hasMany(Roadmap, { as: "roadmaps", foreignKey: "userId" });
Roadmap.belongsTo(User, { as: "owner", foreignKey: "userId" });
Roadmap.hasMany(RoadmapTask, {
  as: "tasks",
  foreignKey: "roadmapId",
  onDelete: "CASCADE",
  hooks: true,
});
RoadmapTask.belongsTo(Roadmap, { as: "roadmap", foreignKey: "roadmapId" });
User.hasMany(SkillGap, { as: "skillGaps", foreignKey: "userId" });
SkillGap.belongsTo(User, { as: "owner", foreignKey: "userId" });
SkillGap.hasMany(Roadmap, { as: "roadmaps", foreignKey: "skillGapId" });
Roadmap.belongsTo(SkillGap, { as: "skillGap", foreignKey: "skillGapId" });
