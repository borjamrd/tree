'use client'
import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type OnNodesChange,
  type NodeChange,
  type Connection,
  applyNodeChanges,
  ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { UserPlus } from 'lucide-react'
import { PersonNode } from './PersonNode'
import { UnionNode } from './UnionNode'
import { DeletableEdge } from './DeletableEdge'
import { RelativeSidebar } from './RelativeSidebar'
import { PersonDetailSidebar, type PersonDetail, type KinshipData } from './PersonDetailSidebar'
import { AddPersonSidebar } from './AddPersonSidebar'
import { treeToFlow } from '@/lib/tree-transform'
import { updatePersonPosition, setPersonAsSelf } from '@/server/persons'
import { linkPersons, addExistingChild, addChild, deleteUnion, removeChild, updateUnionPosition } from '@/server/relationships'

const nodeTypes = {
  person: PersonNode,
  union: UnionNode,
}

const edgeTypes = {
  deletable: DeletableEdge,
}

type Props = {
  treeId: string
  persons: Parameters<typeof treeToFlow>[0]
  unions: Parameters<typeof treeToFlow>[1]
  parentage: Parameters<typeof treeToFlow>[2]
}

function computeKinship(
  personId: string,
  persons: Props['persons'],
  unions: Props['unions'],
  parentage: Props['parentage'],
): KinshipData {
  const personMap = new Map(persons.map((p) => [p.id, p]))

  // Parents: parentage records where childId matches → look up union → get both partners
  const parentUnionIds = new Set(
    parentage.filter((r) => r.childId === personId).map((r) => r.unionId)
  )
  const parentIds = new Set<string>()
  for (const uid of parentUnionIds) {
    const u = unions.find((u) => u.id === uid)
    if (!u) continue
    if (u.person1Id) parentIds.add(u.person1Id)
    if (u.person2Id) parentIds.add(u.person2Id)
  }

  // Partners: unions where this person is person1 or person2
  const partnerIds = new Set<string>()
  for (const u of unions) {
    if (u.person1Id === personId && u.person2Id) partnerIds.add(u.person2Id)
    if (u.person2Id === personId) partnerIds.add(u.person1Id)
  }

  // Children: unions where this person is person1 or person2 → parentage records for those unions
  const myUnionIds = new Set(
    unions.filter((u) => u.person1Id === personId || u.person2Id === personId).map((u) => u.id)
  )
  const childIds = new Set<string>()
  for (const r of parentage) {
    if (myUnionIds.has(r.unionId)) childIds.add(r.childId)
  }

  const pick = (ids: Set<string>) =>
    [...ids].flatMap((id) => {
      const p = personMap.get(id)
      return p ? [{ id: p.id, firstName: p.firstName, lastName: p.lastName, lastName2: (p.lastName2 as string | null | undefined) }] : []
    })

  return { parents: pick(parentIds), partners: pick(partnerIds), children: pick(childIds) }
}

type SidebarState = {
  personId: string
  firstName: string
  lastName?: string | null
  position: { x: number; y: number }
} | null

let positionTimer: ReturnType<typeof setTimeout>

export function TreeCanvas({ treeId, persons, unions, parentage }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [sidebar, setSidebar] = useState<SidebarState>(null)
  const [personDetail, setPersonDetail] = useState<PersonDetail | null>(null)
  const [personKinship, setPersonKinship] = useState<KinshipData | null>(null)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const t = useTranslations('treePage')

  const { nodes: initialNodes, edges: initialEdges } = treeToFlow(persons, unions, parentage)
  const [nodes, setNodes] = useNodesState(initialNodes)
  const [edges, setEdges] = useEdgesState(initialEdges)

  // Sync when server data refreshes
  useEffect(() => {
    const { nodes: freshNodes, edges: freshEdges } = treeToFlow(persons, unions, parentage)
    setNodes(freshNodes)
    setEdges(freshEdges)
  }, [persons, unions, parentage, setNodes, setEdges])

  // Stable callback passed into node data
  const handleAddRelative = useCallback((personId: string) => {
    const node = nodes.find((n) => n.id === personId)
    if (!node) return
    const d = node.data as { firstName: string; lastName?: string | null }
    setPersonDetail(null)
    setPersonKinship(null)
    setSidebar({
      personId,
      firstName: d.firstName,
      lastName: d.lastName,
      position: node.position,
    })
  }, [nodes])

  const handleToggleSelf = useCallback((personId: string, isSelf: boolean) => {
    startTransition(async () => {
      await setPersonAsSelf(personId, isSelf)
      router.refresh()
    })
  }, [router])

  const handlePersonClick = useCallback((personId: string) => {
    const node = nodes.find((n) => n.id === personId)
    if (!node) return
    setSidebar(null)
    setPersonDetail(node.data as PersonDetail)
    setPersonKinship(computeKinship(personId, persons, unions, parentage))
  }, [nodes, persons, unions, parentage])

  // Inject callbacks into person node data
  const nodesWithCallback = nodes.map((n) =>
    n.type === 'person'
      ? { ...n, data: { ...n.data, onAddRelative: handleAddRelative, onPersonClick: handlePersonClick } }
      : n
  )

  const handleDeleteEdge = useCallback((edgeId: string) => {
    startTransition(async () => {
      if (edgeId.startsWith('e-par-')) {
        await removeChild(edgeId.replace('e-par-', ''))
      } else {
        await deleteUnion(edgeId.replace(/^e-p[12]-/, ''))
      }
      router.refresh()
    })
  }, [router])

  const edgesWithDelete = edges.map((e) => ({
    ...e,
    data: { ...e.data, onDelete: () => handleDeleteEdge(e.id) },
  }))

  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds))

    const positionChange = changes.find(
      (c) => c.type === 'position' && !c.dragging && c.position
    )
    if (positionChange && positionChange.type === 'position' && positionChange.position) {
      const { id, position } = positionChange
      clearTimeout(positionTimer)
      positionTimer = setTimeout(() => {
        if (id.startsWith('union-')) {
          updateUnionPosition(id.replace('union-', ''), position!.x, position!.y)
        } else {
          updatePersonPosition(id, position!.x, position!.y)
        }
      }, 500)
    }
  }, [setNodes])

  const onConnect = useCallback((connection: Connection) => {
    const { source, target, sourceHandle } = connection
    if (!source || !target) return

    const isSourceUnion = source.startsWith('union-')
    const isTargetUnion = target.startsWith('union-')

    startTransition(async () => {
      if (!isSourceUnion && !isTargetUnion) {
        const sourceNode = nodes.find((n) => n.id === source)
        const targetNode = nodes.find((n) => n.id === target)
        const sX = sourceNode?.position.x ?? 0
        const tX = targetNode?.position.x ?? 0
        const sY = sourceNode?.position.y ?? 0
        const tY = targetNode?.position.y ?? 0
        const CENTER = 72 // (NODE_W - UNION_W) / 2

        let result: { success: boolean; error?: string } | undefined

        if (sourceHandle === 'left' || sourceHandle === 'right') {
          const unionX = (sX + tX) / 2 + CENTER
          const unionY = Math.max(sY, tY) + 120
          result = await linkPersons(treeId, source, target, { x: unionX, y: unionY })
        } else if (sourceHandle === 'bottom') {
          const unionX = sX + CENTER
          const unionY = sY + 100
          await addExistingChild(treeId, source, target, { x: unionX, y: unionY })
        } else if (sourceHandle === 'top') {
          const unionX = tX + CENTER
          const unionY = tY + 100
          await addExistingChild(treeId, target, source, { x: unionX, y: unionY })
        }

        if (result && !result.success) {
          toast.error(result.error)
          return
        }
        router.refresh()
      } else if (isSourceUnion && !isTargetUnion) {
        const unionId = source.replace('union-', '')
        const result = await addChild(unionId, target)
        if (!result.success) { toast.error(result.error); return }
        router.refresh()
      } else if (!isSourceUnion && isTargetUnion) {
        const unionId = target.replace('union-', '')
        const result = await addChild(unionId, source)
        if (!result.success) { toast.error(result.error); return }
        router.refresh()
      }
    })
  }, [nodes, treeId, router, startTransition])

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodesWithCallback}
        edges={edgesWithDelete}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Controls showInteractive={false} />
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="#D4C9B5"
        />
      </ReactFlow>

      {/* Transparent backdrop — closes any open sidebar on outside click */}
      {(personDetail ?? sidebar ?? (showAddPerson || null)) && (
        <div
          className="absolute inset-0 z-[9]"
          onClick={() => { setPersonDetail(null); setPersonKinship(null); setSidebar(null); setShowAddPerson(false) }}
        />
      )}

      {personDetail && (
        <PersonDetailSidebar
          person={personDetail}
          kinship={personKinship ?? undefined}
          onClose={() => { setPersonDetail(null); setPersonKinship(null) }}
          onToggleSelf={(isSelf) => handleToggleSelf(personDetail.id, isSelf)}
          onAddRelative={() => {
            setSidebar({
              personId: personDetail.id,
              firstName: personDetail.firstName,
              lastName: personDetail.lastName,
              position: nodes.find((n) => n.id === personDetail.id)?.position ?? { x: 0, y: 0 },
            })
            setPersonDetail(null)
            setPersonKinship(null)
          }}
        />
      )}

      {sidebar && (
        <RelativeSidebar
          treeId={treeId}
          anchorPerson={{
            id: sidebar.personId,
            firstName: sidebar.firstName,
            lastName: sidebar.lastName,
            position: sidebar.position,
          }}
          onClose={() => setSidebar(null)}
          onSuccess={() => {
            setSidebar(null)
            router.refresh()
          }}
        />
      )}

      {showAddPerson && (
        <AddPersonSidebar
          treeId={treeId}
          onClose={() => setShowAddPerson(false)}
        />
      )}

      {/* Add Person button — floats in the top-right of the canvas */}
      {!showAddPerson && !personDetail && !sidebar && (
        <button
          onClick={() => setShowAddPerson(true)}
          className="absolute top-4 right-4 z-20 group flex items-center gap-2 px-5 py-2.5 transition-all duration-150"
          style={{
            border: '1px solid var(--rule)',
            background: 'var(--parchment)',
            color: 'var(--sepia)',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(28,21,16,0.06)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--ink)'
            e.currentTarget.style.color = 'var(--ink)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--rule)'
            e.currentTarget.style.color = 'var(--sepia)'
          }}
        >
          <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>{t('addPerson')}</span>
        </button>
      )}
    </div>
  )
}
