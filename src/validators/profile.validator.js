import { z } from "zod";

export const profileSchema = z
  .object({
    bio: z.string().max(1000).nullable().optional(),

    phone: z.string().max(30).nullable().optional(),

    location: z.string().max(120).nullable().optional(),

    profileImage: z.string().max(2048).nullable().optional(),

    education: z.string().max(1000).nullable().optional(),

    experience: z.string().max(2000).nullable().optional(),

    careerGoal: z.string().max(1000).nullable().optional(),
  })
  .strict();