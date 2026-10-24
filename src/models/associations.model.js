
import User from "./user.model.js";
import Profile from "./profile.model.js";
import Skill from "./skill.model.js";
import UserSkill from "./UserSkill.model.js";
import Recommendation from "./recommendation.model.js";
import Progress from "./progress.model.js";

User.hasOne(Profile, {
  foreignKey: "userId",
  as: "profile",
  onDelete: "CASCADE",
});

Profile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(UserSkill, {
  foreignKey: "userId",
  as: "userSkills",
});

UserSkill.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Skill.hasMany(UserSkill, {
  foreignKey: "skillId",
  as: "userSkills",
});

UserSkill.belongsTo(Skill, {
  foreignKey: "skillId",
  as: "skill",
});

// A skill can have multiple recommendations.
Skill.hasMany(Recommendation, {
  foreignKey: "skillId",
  as: "recommendations",
});

Recommendation.belongsTo(Skill, {
  foreignKey: "skillId",
  as: "skill",
});

// A user can track multiple recommendations.
User.hasMany(Progress, {
  foreignKey: "userId",
  as: "learningProgress",
});

Progress.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// A recommendation can be tracked by multiple users.
Recommendation.hasMany(Progress, {
  foreignKey: "recommendationId",
  as: "progressRecords",
});

Progress.belongsTo(Recommendation, {
  foreignKey: "recommendationId",
  as: "recommendation",
});
export { User, Profile, Skill, UserSkill,Progress, Recommendation};
