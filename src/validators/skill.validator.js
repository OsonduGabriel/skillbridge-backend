
import { z } from "zod";

export const skillCategory = z.enum([
  "technical",
  "professional",
  "industry",
  "transferable",
]);

const proficiencyLevel = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export const skillSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().max(1000).nullable().optional(),
    category: skillCategory,
  })
  .strict();

export const skillUpdateSchema = skillSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Provide at least one field to update." }
  );

export const skillSearchSchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    category: skillCategory.optional(),
  })
  .strict();

export const addUserSkillSchema = z
  .object({
    skillId: z.coerce.number().int().positive(),
    proficiencyLevel: proficiencyLevel.default("beginner"),
  })
  .strict();

export const updateUserSkillSchema = z
  .object({
    proficiencyLevel,
  })
  .strict();
