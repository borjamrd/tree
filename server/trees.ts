'use server'
import { requireUser } from '@/lib/get-session'
import { db } from '@/lib/db'
import { trees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { treeSchema, type TreeInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

type Result<T = void> = { success: true; data?: T } | { success: false; error: string }

export async function createTree(input: TreeInput): Promise<Result<typeof trees.$inferSelect>> {
  try {
    const user = await requireUser()
    const data = treeSchema.parse(input)
    const [tree] = await db.insert(trees).values({ ...data, userId: user.id }).returning()
    revalidatePath('/dashboard')
    return { success: true, data: tree }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}

export async function getUserTrees() {
  const user = await requireUser()
  return db.query.trees.findMany({
    where: eq(trees.userId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
}

export async function getTree(treeId: string) {
  const user = await requireUser()
  return db.query.trees.findFirst({
    where: and(eq(trees.id, treeId), eq(trees.userId, user.id)),
  })
}

export async function updateTree(treeId: string, input: Partial<TreeInput>): Promise<Result> {
  try {
    const user = await requireUser()
    await db.update(trees)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(trees.id, treeId), eq(trees.userId, user.id)))
    revalidatePath('/dashboard')
    revalidatePath(`/trees/${treeId}`)
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update tree' }
  }
}

export async function deleteTree(treeId: string): Promise<Result> {
  try {
    const user = await requireUser()
    await db.delete(trees).where(and(eq(trees.id, treeId), eq(trees.userId, user.id)))
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete tree' }
  }
}

