'use server'
import { requireUser } from '@/lib/get-session'
import { db } from '@/lib/db'
import { trees, treeMembers } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { treeSchema, type TreeInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { requireTreeAccess, requireTreeAdmin } from '@/lib/tree-access'

type Result<T = void> = { success: true; data?: T } | { success: false; error: string }

export async function createTree(input: TreeInput): Promise<Result<typeof trees.$inferSelect>> {
  try {
    const user = await requireUser()
    const data = treeSchema.parse(input)
    const [tree] = await db
      .insert(trees)
      .values({ ...data, userId: user.id })
      .returning()
    revalidatePath('/dashboard')
    return { success: true, data: tree }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}

export async function getUserTrees() {
  const user = await requireUser()

  const ownTrees = await db.query.trees.findMany({
    where: eq(trees.userId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })

  const memberships = await db.query.treeMembers.findMany({
    where: and(eq(treeMembers.userId, user.id), eq(treeMembers.status, 'accepted')),
  })

  const sharedTrees =
    memberships.length > 0
      ? await db.query.trees.findMany({
          where: inArray(
            trees.id,
            memberships.map((m) => m.treeId)
          ),
          orderBy: (t, { desc }) => [desc(t.createdAt)],
        })
      : []

  return [
    ...ownTrees.map((t) => ({ ...t, isShared: false })),
    ...sharedTrees.map((t) => ({ ...t, isShared: true })),
  ]
}

export async function getTree(treeId: string) {
  const user = await requireUser()
  const { tree } = await requireTreeAccess(treeId, user.id)
  return tree
}

export async function updateTree(treeId: string, input: Partial<TreeInput>): Promise<Result> {
  try {
    const user = await requireUser()
    await requireTreeAccess(treeId, user.id)
    await db
      .update(trees)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(trees.id, treeId))
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
    await requireTreeAdmin(treeId, user.id)
    await db.delete(trees).where(eq(trees.id, treeId))
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete tree' }
  }
}
