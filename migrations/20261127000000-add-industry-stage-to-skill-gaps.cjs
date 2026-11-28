'use strict';

/**
 * Adds the industry and career stage a skill gap was analysed with, so the
 * roadmap can be generated from the same context.
 *
 * The same change as plain SQL (Supabase SQL editor):
 *   docs/sql/20261127-add-industry-stage-to-skill-gaps.sql
 *
 * Run this BEFORE deploying the code that reads the new columns.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('skill_gaps');

    if (!table.industryFocus) {
      await queryInterface.addColumn('skill_gaps', 'industryFocus', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    if (!table.careerStage) {
      await queryInterface.addColumn('skill_gaps', 'careerStage', {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('skill_gaps');

    if (table.careerStage) {
      await queryInterface.removeColumn('skill_gaps', 'careerStage');
    }

    if (table.industryFocus) {
      await queryInterface.removeColumn('skill_gaps', 'industryFocus');
    }
  },
};
