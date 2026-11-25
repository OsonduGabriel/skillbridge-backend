"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex(
      "roadmaps",
      ["userId", "skillGapId"],
      {
        unique: true,
        name: "unique_user_skillgap_roadmap",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "roadmaps",
      "unique_user_skillgap_roadmap"
    );
  },
};