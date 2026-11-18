import sequelize from "../src/config/database.js";

async function inspectRecommendations() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful.");

    const [results] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM skills) AS total_skills,
        (SELECT COUNT(*) FROM skills WHERE is_active = true) AS active_skills,
        (SELECT COUNT(*) FROM recommendations) AS total_recommendations,
        (SELECT COUNT(*) FROM recommendations WHERE is_active = true) AS active_recommendations,
        (
          SELECT COUNT(*)
          FROM recommendations r
          INNER JOIN skills s ON s.id = r.skill_id
          WHERE r.is_active = true
        ) AS active_recommendations_with_skills,
        (SELECT COUNT(*) FROM user_skills) AS total_user_skills;
    `);

    console.table(results);
  } catch (error) {
    console.error("Inspection failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

inspectRecommendations();
