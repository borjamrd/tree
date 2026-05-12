import { z } from 'zod'

export const treeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
})

export const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  maidenName: z.string().max(100).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().max(200).optional(),
  deathDate: z.string().optional(),
  deathPlace: z.string().max(200).optional(),
  isAlive: z.boolean().optional(),
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  bio: z.string().max(2000).optional(),
})

export type TreeInput = z.infer<typeof treeSchema>
export type PersonInput = z.infer<typeof personSchema>
