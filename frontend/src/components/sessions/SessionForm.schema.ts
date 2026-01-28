import { z } from 'zod'

/**
 * Zod schema for session form validation
 */
export const sessionFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Session name is required')
    .max(100, 'Session name must be 100 characters or less'),
})

export type SessionFormData = z.infer<typeof sessionFormSchema>

/**
 * Default values for session form
 */
export const sessionFormDefaults: SessionFormData = {
  name: '',
}
