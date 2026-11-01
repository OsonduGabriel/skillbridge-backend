
import User from "./user.model.js";
import Profile from "./profile.model.js";
import Skill from "./skill.model.js";
import UserSkill from "./UserSkill.model.js";
import Recommendation from "./recommendation.model.js";
import Progress from "./progress.model.js";

// User and Profile relationship
User.hasOne(Profile, {
  foreignKey: "userId",
  as: "profile",
  onDelete: "CASCADE",
});

Profile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// User and UserSkill relationships
User.hasMany(UserSkill, {
  foreignKey: "userId",
  as: "userSkills",
});

UserSkill.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Skill and UserSkill relationships
Skill.hasMany(UserSkill, {
  foreignKey: "skillId",
  as: "userSkills",
});

UserSkill.belongsTo(Skill, {
  foreignKey: "skillId",
  as: "skill",
});

// Skill and Recommendation relationships
Skill.hasMany(Recommendation, {
  foreignKey: "skillId",
  as: "recommendations",
});

Recommendation.belongsTo(Skill, {
  foreignKey: "skillId",
  as: "skill",
});

// User and Progress relationships
User.hasMany(Progress, {
  foreignKey: "userId",
  as: "learningProgress",
});

Progress.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Recommendation and Progress relationships
Recommendation.hasMany(Progress, {
  foreignKey: "recommendationId",
  as: "progressRecords",
});

Progress.belongsTo(Recommendation, {
  foreignKey: "recommendationId",
  as: "recommendation",
});

export {
  User,
  Profile,
  Skill,
  UserSkill,
  Progress,
  Recommendation,
};
