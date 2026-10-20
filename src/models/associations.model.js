
import User from "./user.model.js";
import Profile from "./profile.model.js";
import Skill from "./skill.model.js";
import UserSkill from "./UserSkill.model.js";

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

export { User, Profile, Skill, UserSkill };
