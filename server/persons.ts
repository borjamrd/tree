'use server'
import { requireUser } from '@/lib/get-session'
import { db } from '@/lib/db'
import { persons, trees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { personSchema, type PersonInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

type Result<T = void> = { success: true; data?: T } | { success: false; error: string }

function sanitize(input: PersonInput) {
  const nullIfEmpty = (v: string | undefined) => (v === '' || v === undefined ? null : v)
  return {
    ...input,
    lastName: nullIfEmpty(input.lastName),
    lastName2: nullIfEmpty(input.lastName2),
    birthDate: nullIfEmpty(input.birthDate),
    birthPlace: nullIfEmpty(input.birthPlace),
    deathDate: nullIfEmpty(input.deathDate),
    deathPlace: nullIfEmpty(input.deathPlace),
    photoUrl: nullIfEmpty(input.photoUrl),
    bio: nullIfEmpty(input.bio),
    isAlive: input.isAlive ?? true,
    gender: input.gender ?? 'unknown',
  }
}

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

export async function createPerson(
  treeId: string,
  input: PersonInput
): Promise<Result<typeof persons.$inferSelect>> {
  try {
    const user = await requireUser()
    await verifyTreeOwnership(treeId, user.id)
    const data = sanitize(personSchema.parse(input))
    const [person] = await db.insert(persons).values({ ...data, treeId }).returning()
    revalidatePath(`/trees/${treeId}`)
    return { success: true, data: person }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create person' }
  }
}

export async function updatePerson(
  personId: string,
  input: Partial<PersonInput>
): Promise<Result> {
  try {
    const user = await requireUser()
    const person = await verifyPersonOwnership(personId, user.id)
    await db.update(persons).set(sanitize(input as PersonInput)).where(eq(persons.id, personId))
    revalidatePath(`/trees/${person.treeId}`)
    revalidatePath(`/trees/${person.treeId}/persons/${personId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update person' }
  }
}

export async function deletePerson(personId: string): Promise<Result> {
  try {
    const user = await requireUser()
    const person = await verifyPersonOwnership(personId, user.id)
    await db.delete(persons).where(eq(persons.id, personId))
    revalidatePath(`/trees/${person.treeId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete person' }
  }
}

export async function updatePersonPosition(personId: string, x: number, y: number) {
  try {
    const user = await requireUser()
    await verifyPersonOwnership(personId, user.id)
    await db.update(persons)
      .set({ posX: String(x), posY: String(y) })
      .where(eq(persons.id, personId))
  } catch {}
}

export async function setPersonAsSelf(personId: string, isSelf: boolean): Promise<Result> {
  try {
    const user = await requireUser()
    const person = await verifyPersonOwnership(personId, user.id)
    const treeId = person.treeId
    await db.update(persons).set({ isSelf: false }).where(eq(persons.treeId, treeId))
    if (isSelf) {
      await db.update(persons).set({ isSelf: true }).where(eq(persons.id, personId))
    }
    revalidatePath(`/trees/${treeId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update' }
  }
}

export async function getTreePersons(treeId: string) {
  const user = await requireUser()
  await verifyTreeOwnership(treeId, user.id)
  return db.query.persons.findMany({ where: eq(persons.treeId, treeId) })
}

