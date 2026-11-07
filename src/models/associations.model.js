
import User from "./user.model.js";
import Profile from "./profile.model.js";
import Skill from "./skill.model.js";
import UserSkill from "./UserSkill.model.js";
import Recommendation from "./recommendation.model.js";
import Progress from "./progress.model.js";
import Course from "./course.model.js";
import CourseModule from "./course-module.model.js";
import Lesson from "./lesson.model.js";
import Enrollment from "./enrollment.model.js";
import LessonProgress from "./lesson-progress.model.js";
import Certification from "./certification.model.js";
import UserCertification from "./user-certification.model.js";

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

// Course and Course Module relationships
Course.hasMany(CourseModule, {
  foreignKey: "courseId",
  as: "modules",
  onDelete: "CASCADE",
});

CourseModule.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// Course Module and Lesson relationships
CourseModule.hasMany(Lesson, {
  foreignKey: "moduleId",
  as: "lessons",
  onDelete: "CASCADE",
});

Lesson.belongsTo(CourseModule, {
  foreignKey: "moduleId",
  as: "module",
});

// User and Enrollment relationships
User.hasMany(Enrollment, {
  foreignKey: "userId",
  as: "courseEnrollments",
  onDelete: "CASCADE",
});

Enrollment.belongsTo(User, {
  foreignKey: "userId",
  as: "student",
});

// Course and Enrollment relationships
Course.hasMany(Enrollment, {
  foreignKey: "courseId",
  as: "enrollments",
  onDelete: "CASCADE",
});

Enrollment.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// Enrollment and Lesson Progress relationships
Enrollment.hasMany(LessonProgress, {
  foreignKey: "enrollmentId",
  as: "lessonProgress",
  onDelete: "CASCADE",
});

LessonProgress.belongsTo(Enrollment, {
  foreignKey: "enrollmentId",
  as: "enrollment",
});

// Lesson and Lesson Progress relationships
Lesson.hasMany(LessonProgress, {
  foreignKey: "lessonId",
  as: "progressRecords",
  onDelete: "CASCADE",
});

LessonProgress.belongsTo(Lesson, {
  foreignKey: "lessonId",
  as: "lesson",
});

// Course and Certification relationships
Course.hasOne(Certification, {
  foreignKey: "courseId",
  as: "certification",
  onDelete: "CASCADE",
});

Certification.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

// User and User Certification relationships
User.hasMany(UserCertification, {
  foreignKey: "userId",
  as: "certificates",
  onDelete: "CASCADE",
});

UserCertification.belongsTo(User, {
  foreignKey: "userId",
  as: "student",
});

// Certification and User Certification relationships
Certification.hasMany(UserCertification, {
  foreignKey: "certificationId",
  as: "issuedCertificates",
  onDelete: "CASCADE",
});

UserCertification.belongsTo(Certification, {
  foreignKey: "certificationId",
  as: "certification",
});

// Enrollment and User Certification relationships
Enrollment.hasOne(UserCertification, {
  foreignKey: "enrollmentId",
  as: "certificate",
  onDelete: "CASCADE",
});

UserCertification.belongsTo(Enrollment, {
  foreignKey: "enrollmentId",
  as: "enrollment",
});

export {
  User,
  Profile,
  Skill,
  UserSkill,
  Progress,
  Recommendation,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  LessonProgress,
  Certification,
  UserCertification,
};

