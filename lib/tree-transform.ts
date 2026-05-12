import type { Node, Edge } from '@xyflow/react'

type Person = {
  id: string
  firstName: string
  lastName: string | null
  birthDate: string | null
  deathDate: string | null
  photoUrl: string | null
  posX: string | null
  posY: string | null
  [key: string]: unknown
}

type Union = {
  id: string
  person1Id: string
  person2Id: string | null
  posX: string | null
  posY: string | null
  [key: string]: unknown
}

type Parentage = {
  id: string
  unionId: string
  childId: string
  [key: string]: unknown
}

export function treeToFlow(
  persons: Person[],
  treeUnions: Union[],
  treeParentage: Parentage[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  for (const p of persons) {
    nodes.push({
      id: p.id,
      type: 'person',
      position: { x: Number(p.posX ?? 0), y: Number(p.posY ?? 0) },
      data: p,
    })
  }

  for (const u of treeUnions) {
    nodes.push({
      id: `union-${u.id}`,
      type: 'union',
      position: { x: Number(u.posX ?? 0), y: Number(u.posY ?? 0) },
      data: u,
    })

    edges.push({
      id: `e-p1-${u.id}`,
      source: u.person1Id,
      target: `union-${u.id}`,
      targetHandle: 'p1',
      type: 'deletable',
    })

    if (u.person2Id) {
      edges.push({
        id: `e-p2-${u.id}`,
        source: u.person2Id,
        target: `union-${u.id}`,
        targetHandle: 'p2',
        type: 'deletable',
      })
    }
  }

  for (const par of treeParentage) {
    edges.push({
      id: `e-par-${par.id}`,
      source: `union-${par.unionId}`,
      target: par.childId,
      type: 'deletable',
    })
  }

  return { nodes, edges }
}
