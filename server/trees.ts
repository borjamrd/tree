'use server'
import { devSession } from '@/lib/dev-session'
import { db } from '@/lib/db'
import { trees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const createTreeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export async function createTree(input: z.infer<typeof createTreeSchema>) {
  const session = devSession()
  const data = createTreeSchema.parse(input)
  const [tree] = await db.insert(trees).values({
    ...data,
    userId: session.user.id,
  }).returning()

  revalidatePath('/dashboard')
  return tree
}

export async function getUserTrees() {
  const { user } = devSession()
  return db.query.trees.findMany({
    where: eq(trees.userId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
}

export async function getTree(treeId: string) {
  const { user } = devSession()
  return db.query.trees.findFirst({
    where: and(eq(trees.id, treeId), eq(trees.userId, user.id)),
  })
}

export async function updateTree(treeId: string, input: Partial<z.infer<typeof createTreeSchema>>) {
  const { user } = devSession()
  await db.update(trees)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(trees.id, treeId), eq(trees.userId, user.id)))

  revalidatePath('/dashboard')
  revalidatePath(`/trees/${treeId}`)
}

export async function deleteTree(treeId: string) {
  const { user } = devSession()
  await db.delete(trees).where(
    and(eq(trees.id, treeId), eq(trees.userId, user.id))
  )
  revalidatePath('/dashboard')
}
