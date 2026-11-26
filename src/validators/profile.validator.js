
import { z } from "zod";

export const profileSchema = z
  .object({
    // Basic profile information
    bio: z.string().max(1000).nullable().optional(),

    phone: z.string().max(30).nullable().optional(),

    location: z.string().max(120).nullable().optional(),

    profileImage: z.string().max(2048).nullable().optional(),

    education: z.string().max(1000).nullable().optional(),

    experience: z.string().max(2000).nullable().optional(),

    careerGoal: z.string().max(1000).nullable().optional(),

    // Career information from the updated survey
    targetJobTitle: z.string().max(255).nullable().optional(),

    industryFocus: z.string().max(255).nullable().optional(),

    careerStage: z
      .enum(["Student", "Entry", "Mid", "Senior", "Pivot"])
      .nullable()
      .optional(),

    primaryGoal: z
      .enum(["CV Review", "Gap Analysis", "Roadmap"])
      .nullable()
      .optional(),

    // Salary expectations
    payMin: z.number().int().min(0).nullable().optional(),

    payMax: z.number().int().min(0).nullable().optional(),

    // Preferred working arrangement
    workMode: z
      .enum(["remote", "hybrid", "onsite"])
      .nullable()
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.payMin == null ||
      data.payMax == null ||
      data.payMin <= data.payMax,
    {
      message: "Minimum salary cannot be greater than maximum salary.",
      path: ["payMin"],
    }
  );
