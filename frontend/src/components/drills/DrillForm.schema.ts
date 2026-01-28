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
 * - Optional with transforms: num_players (string to number), video_url (empty string to null)
 * - Array defaults: equipment, tags
 * - Custom num_players transform to avoid z.coerce.number() pitfall (converts empty string to 0)
 */
export const drillFormSchema = z.object({
  name: z
    .string()
    .min(1, "Drill name is required")
    .max(100, "Drill name must be 100 characters or less"),
  category: z.enum(DRILL_CATEGORIES, {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  num_players: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => {
      // Transform empty string, undefined, or "" to undefined
      if (val === "" || val === undefined || val === null) {
        return undefined;
      }
      // If already a number, return it
      if (typeof val === "number") {
        return val;
      }
      // Parse string to number
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    })
    .pipe(z.number().int().min(1).max(30).optional()),
  equipment: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  video_url: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
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
  video_url: null,
};
