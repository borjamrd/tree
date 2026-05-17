import { db } from '@/lib/db'
import { trees, treeMembers } from '@/lib/db/schema'
import { and, eq, or, count } from 'drizzle-orm'

export async function canDeleteAccount(
  userId: string
): Promise<{ canDelete: boolean; reason?: string }> {
  const userTrees = await db.query.trees.findMany({
    where: eq(trees.userId, userId),
    columns: { id: true },
  })

  for (const tree of userTrees) {
    const slots = await getActiveSlotCount(tree.id)
    if (slots > 0) {
      return {
        canDelete: false,
        reason:
          'Tienes árboles con colaboradores activos. Elimina todos los colaboradores o los árboles antes de borrar tu cuenta.',
      }
    }
  }

  return { canDelete: true }
}

export async function requireTreeAccess(treeId: string, userId: string) {
  const tree = await db.query.trees.findFirst({
    where: eq(trees.id, treeId),
  })
  if (!tree) throw new Error('Tree not found')

  if (tree.userId === userId) return { tree, role: 'admin' as const }

  const membership = await db.query.treeMembers.findFirst({
    where: and(
      eq(treeMembers.treeId, treeId),
      eq(treeMembers.userId, userId),
      eq(treeMembers.status, 'accepted')
    ),
  })
  if (!membership) throw new Error('Tree not found')

  return { tree, role: 'collaborator' as const }
}

export async function requireTreeAdmin(treeId: string, userId: string) {
  const tree = await db.query.trees.findFirst({
    where: and(eq(trees.id, treeId), eq(trees.userId, userId)),
  })
  if (!tree) throw new Error('Tree not found or insufficient permissions')
  return tree
}

export async function getActiveSlotCount(treeId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(treeMembers)
    .where(
      and(
        eq(treeMembers.treeId, treeId),
        or(eq(treeMembers.status, 'pending'), eq(treeMembers.status, 'accepted'))
      )
    )
  return result[0]?.count ?? 0
}
