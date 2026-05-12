'use server'
import { devSession } from '@/lib/dev-session'
import { db } from '@/lib/db'
import { unions, parentage, trees, persons } from '@/lib/db/schema'
import { eq, and, or, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { personSchema, type PersonInput } from '@/lib/validations'

type RelationshipType = 'partner' | 'child' | 'parent'
type Result<T = void> = { success: true; data?: T } | { success: false; error: string }

function sanitizePerson(input: PersonInput) {
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

const NODE_W  = 160  // PersonNode width (w-40)
const UNION_W = 16   // UnionNode width (w-4)
const H_GAP   = 40   // horizontal gap between sibling nodes
const V_CHILD = 220  // vertical distance person → child
const V_UNION = 100  // vertical distance person → union node
// offset so the union handle (at union center) aligns with the person handle (at person center)
const CENTER  = (NODE_W - UNION_W) / 2  // 72

async function computePosition(
  treeId: string,
  anchorPersonId: string,
  type: RelationshipType,
  anchor: { x: number; y: number }
): Promise<{ personX: number; personY: number; unionX: number; unionY: number }> {
  if (type === 'partner') {
    const person2X = anchor.x + NODE_W + H_GAP
    // union centered between both persons' centers
    const unionCenterX = anchor.x + NODE_W / 2 + (NODE_W + H_GAP) / 2
    return {
      personX: person2X,
      personY: anchor.y,
      unionX:  unionCenterX - UNION_W / 2,
      unionY:  anchor.y + V_UNION,
    }
  }

  if (type === 'child') {
    // Find all existing children across every union this person is part of
    const parentUnions = await db.query.unions.findMany({
      where: and(
        eq(unions.treeId, treeId),
        or(eq(unions.person1Id, anchorPersonId), eq(unions.person2Id, anchorPersonId))
      ),
      with: { children: { with: { child: true } } },
    })

    const siblings = parentUnions.flatMap(u => u.children.map(p => p.child))

    if (siblings.length > 0) {
      const xs = siblings.map(s => Number(s.posX ?? 0))
      const ys = siblings.map(s => Number(s.posY ?? 0))
      const siblingY = Math.round(ys.reduce((a, b) => a + b, 0) / ys.length)
      const childX   = Math.max(...xs) + NODE_W + H_GAP
      return {
        personX: childX,
        personY: siblingY,
        unionX:  childX + CENTER,
        unionY:  siblingY - V_UNION,
      }
    }

    return {
      personX: anchor.x,
      personY: anchor.y + V_CHILD,
      unionX:  anchor.x + CENTER,
      unionY:  anchor.y + V_UNION,
    }
  }

  // type === 'parent'
  return {
    personX: anchor.x,
    personY: anchor.y - V_CHILD,
    unionX:  anchor.x + CENTER,
    unionY:  anchor.y - V_UNION,
  }
}

export async function addRelative(
  treeId: string,
  anchorPersonId: string,
  relationshipType: RelationshipType,
  personData: PersonInput,
  anchorPosition: { x: number; y: number }
): Promise<Result<{ personId: string }>> {
  try {
    const { user } = devSession()
    await verifyTreeOwnership(treeId, user.id)

    const parsed = sanitizePerson(personSchema.parse(personData))
    const pos = await computePosition(treeId, anchorPersonId, relationshipType, anchorPosition)

    const [newPerson] = await db.insert(persons).values({
      ...parsed,
      treeId,
      posX: String(pos.personX),
      posY: String(pos.personY),
    }).returning()

    if (relationshipType === 'partner') {
      await db.insert(unions).values({
        treeId,
        person1Id: anchorPersonId,
        person2Id: newPerson.id,
        type: 'unknown',
        posX: String(pos.unionX),
        posY: String(pos.unionY),
      })
    } else if (relationshipType === 'child') {
      const [union] = await db.insert(unions).values({
        treeId,
        person1Id: anchorPersonId,
        person2Id: null,
        type: 'unknown',
        posX: String(pos.unionX),
        posY: String(pos.unionY),
      }).returning()
      await db.insert(parentage).values({ unionId: union.id, childId: newPerson.id, type: 'biological' })
    } else {
      const [union] = await db.insert(unions).values({
        treeId,
        person1Id: newPerson.id,
        person2Id: null,
        type: 'unknown',
        posX: String(pos.unionX),
        posY: String(pos.unionY),
      }).returning()
      await db.insert(parentage).values({ unionId: union.id, childId: anchorPersonId, type: 'biological' })
    }

    revalidatePath(`/trees/${treeId}`)
    return { success: true, data: { personId: newPerson.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to add relative' }
  }
}

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
): Promise<Result> {
  try {
    const { user } = devSession()
    const union = await verifyUnionOwnership(unionId, user.id)

    const existing = await db.query.parentage.findFirst({
      where: and(eq(parentage.unionId, unionId), eq(parentage.childId, childId)),
    })
    if (existing) return { success: false, error: 'Esta persona ya es hijo/a de esta unión' }

    await db.insert(parentage).values({ unionId, childId, type })
    revalidatePath(`/trees/${union.treeId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al añadir hijo' }
  }
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

export async function addExistingChild(
  treeId: string,
  parentId: string,
  childId: string,
  unionPos: { x: number; y: number }
) {
  const { user } = devSession()
  await verifyTreeOwnership(treeId, user.id)

  const [union] = await db.insert(unions).values({
    treeId,
    person1Id: parentId,
    person2Id: null,
    type: 'unknown',
    posX: String(unionPos.x),
    posY: String(unionPos.y),
  }).returning()

  await db.insert(parentage).values({ unionId: union.id, childId, type: 'biological' })
  revalidatePath(`/trees/${treeId}`)
}

export async function linkPersons(
  treeId: string,
  personAId: string,
  personBId: string,
  unionPos: { x: number; y: number }
): Promise<Result> {
  try {
  const { user } = devSession()
  await verifyTreeOwnership(treeId, user.id)

  // Load all unions (with their children) for both persons
  const [unionsA, unionsB] = await Promise.all([
    db.query.unions.findMany({
      where: and(
        eq(unions.treeId, treeId),
        or(eq(unions.person1Id, personAId), eq(unions.person2Id, personAId))
      ),
      with: { children: true },
    }),
    db.query.unions.findMany({
      where: and(
        eq(unions.treeId, treeId),
        or(eq(unions.person1Id, personBId), eq(unions.person2Id, personBId))
      ),
      with: { children: true },
    }),
  ])

  // Guard: already partners?
  const alreadyPartners = unionsA.some(u =>
    (u.person1Id === personAId && u.person2Id === personBId) ||
    (u.person1Id === personBId && u.person2Id === personAId)
  )
  if (alreadyPartners) return { success: false, error: 'Esta pareja ya está vinculada' }

  // Find pairs of unions that share at least one child — merge those only
  type UnionWithChildren = (typeof unionsA)[number]
  const merges: Array<{ uA: UnionWithChildren; uB: UnionWithChildren; childIds: string[] }> = []
  const mergedAIds = new Set<string>()
  const mergedBIds = new Set<string>()

  for (const uA of unionsA) {
    for (const uB of unionsB) {
      const setA = new Set(uA.children.map((c) => c.childId))
      const setB = new Set(uB.children.map((c) => c.childId))
      const shared = [...setA].filter((id) => setB.has(id))
      if (shared.length > 0) {
        // Collect all children from both unions into the merged one
        const allChildIds = [...new Set([...setA, ...setB])]
        merges.push({ uA, uB, childIds: allChildIds })
        mergedAIds.add(uA.id)
        mergedBIds.add(uB.id)
      }
    }
  }

  if (merges.length > 0) {
    for (const { uA, uB, childIds } of merges) {
      // Create the shared union centered between the two persons
      const [newUnion] = await db.insert(unions).values({
        treeId,
        person1Id: personAId,
        person2Id: personBId,
        type: 'unknown',
        posX: String(unionPos.x),
        posY: String(unionPos.y),
      }).returning()

      // Remove old parentage records from both dissolved unions
      await db.delete(parentage).where(
        and(
          inArray(parentage.childId, childIds),
          inArray(parentage.unionId, [uA.id, uB.id])
        )
      )

      // Re-attach all children to the new shared union
      await db.insert(parentage).values(
        childIds.map((childId) => ({ unionId: newUnion.id, childId, type: 'biological' as const }))
      )

      // Delete the now-empty single-parent unions
      await db.delete(unions).where(inArray(unions.id, [uA.id, uB.id]))
    }
  } else {
    // No children in common — just create a partnership union
    await db.insert(unions).values({
      treeId,
      person1Id: personAId,
      person2Id: personBId,
      type: 'unknown',
      posX: String(unionPos.x),
      posY: String(unionPos.y),
    })
  }

  revalidatePath(`/trees/${treeId}`)
  return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al vincular' }
  }
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
