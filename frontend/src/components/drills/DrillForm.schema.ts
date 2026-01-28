import { z } from "zod";

/**
 * Valid drill categories matching database CHECK constraint
 */
export const DRILL_CATEGORIES = [
  "activation",
  "dribbling",
  "passing",
  "shooting",
] as const;

export type DrillCategory = (typeof DRILL_CATEGORIES)[number];

/**
 * Zod schema for drill form validation
 *
 * Key features:
 * - Required: name (1-100 chars), category (enum)
 * - Optional: num_players (number), video_url, equipment, tags
 * - Arrays default to empty
 * - Custom num_players preprocessing to avoid z.coerce.number() pitfall
 */
export const drillFormSchema = z.object({
  name: z
    .string()
    .min(1, "Drill name is required")
    .max(100, "Drill name must be 100 characters or less"),
  category: z.enum(DRILL_CATEGORIES, {
    message: "Please select a category",
  }),
  num_players: z.number().int().min(1).max(30).optional(),
  equipment: z.array(z.string()),
  tags: z.array(z.string()),
  video_url: z.string().optional().nullable(),
});

export type DrillFormData = z.infer<typeof drillFormSchema>;

/**
 * Default values for drill form
 */
export const drillFormDefaults: DrillFormData = {
  name: "",
  category: "activation",
  num_players: undefined,
  equipment: [],
  tags: [],
  video_url: "",
};
