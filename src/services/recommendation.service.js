
import Recommendation from "../models/recommendation.model.js";
import Skill from "../models/skill.model.js";
import UserSkill from "../models/UserSkill.model.js";
import Profile from "../models/profile.model.js";

export const getRecommendations = async (filters = {}) => {
  const where = {
    isActive: true,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.skillId) {
    where.skillId = filters.skillId;
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

  return Recommendation.findAll({
    where,
    include: [
      {
        model: Skill,
        as: "skill",
        attributes: ["id", "name", "category"],
        required: true,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const getRecommendationById = async (id) => {
  return Recommendation.findOne({
    where: {
      id,
      isActive: true,
    },
    include: [
      {
        model: Skill,
        as: "skill",
        attributes: ["id", "name", "category"],
        required: true,
      },
    ],
  });
};

export const getPersonalizedRecommendations = async (userId) => {
  const [userSkills, profile] = await Promise.all([
    UserSkill.findAll({
      where: { userId },
      attributes: ["skillId", "proficiencyLevel"],
    }),
    Profile.findOne({
      where: { userId },
      attributes: ["careerGoal"],
    }),
  ]);

  const skillIds = userSkills.map((item) => item.skillId);

  const recommendations = await getRecommendations();

  const skillLevels = new Map(
    userSkills.map((item) => [item.skillId, item.proficiencyLevel])
  );

  return recommendations
    .map((item) => {
      const recommendation = item.toJSON();
      const proficiency = skillLevels.get(recommendation.skillId);

      let score = 0;

      if (skillIds.includes(recommendation.skillId)) {
        score += 10;

        if (
          proficiency === "beginner" &&
          recommendation.difficulty === "beginner"
        ) {
          score += 3;
        } else if (
          proficiency === "intermediate" &&
          recommendation.difficulty === "intermediate"
        ) {
          score += 3;
        } else if (
          proficiency === "advanced" &&
          recommendation.difficulty === "advanced"
        ) {
          score += 3;
        }
      }

      recommendation.relevanceScore = score;
      recommendation.careerGoal = profile?.careerGoal ?? null;

      return recommendation;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};
