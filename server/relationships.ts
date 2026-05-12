'use server'
import { devSession } from '@/lib/dev-session'
import { db } from '@/lib/db'
import { unions, parentage, trees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function verifyTreeOwnership(treeId: string, userId: string) {
  const tree = await db.query.trees.findFirst({
    where: and(eq(trees.id, treeId), eq(trees.userId, userId)),
  })
  if (!tree) throw new Error('Tree not found')
  return tree
}

async function verifyUnionOwnership(unionId: string, userId: string) {
  const union = await db.query.unions.findFirst({
    where: eq(unions.id, unionId),
    with: { tree: true },
  })
  if (!union || union.tree.userId !== userId) throw new Error('Union not found')
  return union
}

export async function createUnion(
  treeId: string,
  person1Id: string,
  person2Id: string | null,
  type: 'married' | 'partnered' | 'divorced' | 'separated' | 'unknown' = 'unknown',
  posX = '0',
  posY = '0',
) {
  const { user } = devSession()
  await verifyTreeOwnership(treeId, user.id)

  const [union] = await db.insert(unions).values({ treeId, person1Id, person2Id, type, posX, posY }).returning()
  revalidatePath(`/trees/${treeId}`)
  return union
}

export async function updateUnion(
  unionId: string,
  data: Partial<{
    type: 'married' | 'partnered' | 'divorced' | 'separated' | 'unknown'
    startDate: string
    endDate: string
    notes: string
    posX: string
    posY: string
  }>
) {
  const { user } = devSession()
  const union = await verifyUnionOwnership(unionId, user.id)
  await db.update(unions).set(data).where(eq(unions.id, unionId))
  revalidatePath(`/trees/${union.treeId}`)
}

export async function deleteUnion(unionId: string) {
  const { user } = devSession()
  const union = await verifyUnionOwnership(unionId, user.id)
  await db.delete(unions).where(eq(unions.id, unionId))
  revalidatePath(`/trees/${union.treeId}`)
}

export async function addChild(
  unionId: string,
  childId: string,
  type: 'biological' | 'adoptive' | 'step' | 'foster' | 'unknown' = 'biological'
) {
  const { user } = devSession()
  const union = await verifyUnionOwnership(unionId, user.id)
  const [entry] = await db.insert(parentage).values({ unionId, childId, type }).returning()
  revalidatePath(`/trees/${union.treeId}`)
  return entry
}

export async function removeChild(parentageId: string) {
  const { user } = devSession()
  const entry = await db.query.parentage.findFirst({
    where: eq(parentage.id, parentageId),
    with: { union: { with: { tree: true } } },
  })
  if (!entry || entry.union.tree.userId !== user.id) throw new Error('Not found')
  await db.delete(parentage).where(eq(parentage.id, parentageId))
  revalidatePath(`/trees/${entry.union.treeId}`)
}

export async function getTreeRelationships(treeId: string) {
  const { user } = devSession()
  await verifyTreeOwnership(treeId, user.id)

  const [treeUnions, treeParentage] = await Promise.all([
    db.query.unions.findMany({ where: eq(unions.treeId, treeId) }),
    db.query.parentage.findMany({
      where: (p, { inArray }) =>
        inArray(
          p.unionId,
          db.select({ id: unions.id }).from(unions).where(eq(unions.treeId, treeId))
        ),
    }),
  ])

  return { unions: treeUnions, parentage: treeParentage }
}
