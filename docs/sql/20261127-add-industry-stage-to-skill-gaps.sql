-- Adds the industry and career stage a skill gap was analysed with.
-- Safe to run more than once. Run BEFORE deploying the matching backend code.
ALTER TABLE skill_gaps
  ADD COLUMN IF NOT EXISTS "industryFocus" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "careerStage" VARCHAR(20);

-- Rollback (only if needed):
-- ALTER TABLE skill_gaps DROP COLUMN IF EXISTS "careerStage", DROP COLUMN IF EXISTS "industryFocus";
