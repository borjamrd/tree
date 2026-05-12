'use server'
import { devSession } from '@/lib/dev-session'
import { db } from '@/lib/db'
import { persons, trees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const personSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  maidenName: z.string().max(100).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).default('unknown'),
  birthDate: z.string().optional(),
  birthPlace: z.string().max(200).optional(),
  deathDate: z.string().optional(),
  deathPlace: z.string().max(200).optional(),
  isAlive: z.boolean().default(true),
  photoUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(2000).optional(),
})

async function verifyTreeOwnership(treeId: string, userId: string) {
  const tree = await db.query.trees.findFirst({
    where: and(eq(trees.id, treeId), eq(trees.userId, userId)),
  })
  if (!tree) throw new Error('Tree not found')
  return tree
}

async function verifyPersonOwnership(personId: string, userId: string) {
  const person = await db.query.persons.findFirst({
    where: eq(persons.id, personId),
    with: { tree: true },
  })
  if (!person || person.tree.userId !== userId) throw new Error('Person not found')
  return person
}

export async function createPerson(treeId: string, input: z.infer<typeof personSchema>) {
  const { user } = devSession()
  await verifyTreeOwnership(treeId, user.id)
  const data = personSchema.parse(input)

  const [person] = await db.insert(persons).values({
    ...data,
    treeId,
    photoUrl: data.photoUrl || null,
  }).returning()

  revalidatePath(`/trees/${treeId}`)
  return person
}

export async function updatePerson(personId: string, input: Partial<z.infer<typeof personSchema>>) {
  const { user } = devSession()
  const person = await verifyPersonOwnership(personId, user.id)

  await db.update(persons).set(input).where(eq(persons.id, personId))

  revalidatePath(`/trees/${person.treeId}`)
  revalidatePath(`/trees/${person.treeId}/persons/${personId}`)
}

export async function deletePerson(personId: string) {
  const { user } = devSession()
  const person = await verifyPersonOwnership(personId, user.id)

  await db.delete(persons).where(eq(persons.id, personId))
  revalidatePath(`/trees/${person.treeId}`)
}

export async function updatePersonPosition(personId: string, x: number, y: number) {
  const { user } = devSession()
  await verifyPersonOwnership(personId, user.id)
  await db.update(persons)
    .set({ posX: String(x), posY: String(y) })
    .where(eq(persons.id, personId))
}

export async function getTreePersons(treeId: string) {
  const { user } = devSession()
  await verifyTreeOwnership(treeId, user.id)
  return db.query.persons.findMany({
    where: eq(persons.treeId, treeId),
  })
}
