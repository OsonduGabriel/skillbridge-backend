
import User from "./user.model.js";
import CV from "./cv.model.js";
import CVAnalysis from "./cv.analysis.model.js";
import SkillGap from "./skillgap.model.js";

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

export {
  User,
  CV,
  CVAnalysis,
  SkillGap
};
