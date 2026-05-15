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
import { updatePersonPosition, setPersonAsSelf, deletePerson } from '@/server/persons'
import {
  linkPersons,
  addExistingChild,
  addChild,
  deleteUnion,
  removeChild,
  updateUnionPosition,
} from '@/server/relationships'

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
  parentage: Props['parentage']
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
      return p
        ? [
            {
              id: p.id,
              firstName: p.firstName,
              lastName: p.lastName,
              lastName2: p.lastName2 as string | null | undefined,
            },
          ]
        : []
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

  // Optimistically remove a union node and all its edges
  const removeUnionOptimistic = useCallback(
    (unionId: string) => {
      const nodeId = `union-${unionId}`
      setNodes((prev) => prev.filter((n) => n.id !== nodeId))
      setEdges((prev) =>
        prev.filter(
          (e) => e.id !== `e-p1-${unionId}` && e.id !== `e-p2-${unionId}` && e.source !== nodeId
        )
      )
    },
    [setNodes, setEdges]
  )

  // Stable callback passed into node data
  const handleAddRelative = useCallback(
    (personId: string) => {
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
    },
    [nodes]
  )

  const handleToggleSelf = useCallback(
    (personId: string, isSelf: boolean) => {
      startTransition(async () => {
        await setPersonAsSelf(personId, isSelf)
        router.refresh()
      })
    },
    [router]
  )

  const handlePersonClick = useCallback(
    (personId: string) => {
      const node = nodes.find((n) => n.id === personId)
      if (!node) return
      setSidebar(null)
      setPersonDetail(node.data as PersonDetail)
      setPersonKinship(computeKinship(personId, persons, unions, parentage))
    },
    [nodes, persons, unions, parentage]
  )

  const handleDeleteUnion = useCallback(
    (unionId: string) => {
      removeUnionOptimistic(unionId)
      startTransition(async () => {
        await deleteUnion(unionId)
        router.refresh()
      })
    },
    [router, removeUnionOptimistic]
  )

  // Inject callbacks into node data
  const nodesWithCallback = nodes.map((n) => {
    if (n.type === 'person') {
      return {
        ...n,
        data: { ...n.data, onAddRelative: handleAddRelative, onPersonClick: handlePersonClick },
      }
    }
    if (n.type === 'union') {
      const unionId = n.id.replace('union-', '')
      return {
        ...n,
        data: { ...n.data, onDelete: () => handleDeleteUnion(unionId) },
      }
    }
    return n
  })

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      if (edgeId.startsWith('e-par-')) {
        setEdges((prev) => prev.filter((e) => e.id !== edgeId))
        startTransition(async () => {
          await removeChild(edgeId.replace('e-par-', ''))
          router.refresh()
        })
      } else {
        const unionId = edgeId.replace(/^e-p[12]-/, '')
        removeUnionOptimistic(unionId)
        startTransition(async () => {
          await deleteUnion(unionId)
          router.refresh()
        })
      }
    },
    [router, removeUnionOptimistic, setEdges]
  )

  const edgesWithDelete = edges.map((e) => ({
    ...e,
    data: { ...e.data, onDelete: () => handleDeleteEdge(e.id) },
  }))

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds))

      const positionChange = changes.find((c) => c.type === 'position' && !c.dragging && c.position)
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
    },
    [setNodes]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target, sourceHandle } = connection
      if (!source || !target) return

      const isSourceUnion = source.startsWith('union-')
      const isTargetUnion = target.startsWith('union-')
      const CENTER = 72 // (NODE_W - UNION_W) / 2

      if (!isSourceUnion && !isTargetUnion) {
        const sourceNode = nodes.find((n) => n.id === source)
        const targetNode = nodes.find((n) => n.id === target)
        const sX = sourceNode?.position.x ?? 0
        const tX = targetNode?.position.x ?? 0
        const sY = sourceNode?.position.y ?? 0
        const tY = targetNode?.position.y ?? 0

        if (sourceHandle === 'left' || sourceHandle === 'right') {
          // Link two persons as partners → new union node
          const unionX = (sX + tX) / 2 + CENTER
          const unionY = Math.max(sY, tY) + 120
          const tempId = crypto.randomUUID()
          const tempNodeId = `union-${tempId}`
          setNodes((prev) => [
            ...prev,
            {
              id: tempNodeId,
              type: 'union',
              position: { x: unionX - CENTER, y: unionY },
              data: { id: tempId },
            },
          ])
          setEdges((prev) => [
            ...prev,
            {
              id: `e-p1-${tempId}`,
              source,
              sourceHandle: 'bottom',
              target: tempNodeId,
              targetHandle: 'p1',
              type: 'deletable',
            },
            {
              id: `e-p2-${tempId}`,
              source: target,
              sourceHandle: 'bottom',
              target: tempNodeId,
              targetHandle: 'p2',
              type: 'deletable',
            },
          ])
          startTransition(async () => {
            const result = await linkPersons(treeId, source, target, { x: unionX, y: unionY })
            if (result && !result.success) {
              toast.error(result.error)
              setNodes((prev) => prev.filter((n) => n.id !== tempNodeId))
              setEdges((prev) =>
                prev.filter((e) => e.id !== `e-p1-${tempId}` && e.id !== `e-p2-${tempId}`)
              )
              return
            }
            router.refresh()
          })
        } else if (sourceHandle === 'bottom' || sourceHandle === 'top') {
          // Connect parent → child → new single-parent union node
          const parentId = sourceHandle === 'bottom' ? source : target
          const childId = sourceHandle === 'bottom' ? target : source
          const parentNode = nodes.find((n) => n.id === parentId)
          const pX = parentNode?.position.x ?? 0
          const pY = parentNode?.position.y ?? 0
          const unionX = pX + CENTER
          const unionY = pY + 100
          const tempId = crypto.randomUUID()
          const tempNodeId = `union-${tempId}`
          const tempParId = crypto.randomUUID()
          setNodes((prev) => [
            ...prev,
            {
              id: tempNodeId,
              type: 'union',
              position: { x: unionX - CENTER, y: unionY },
              data: { id: tempId },
            },
          ])
          setEdges((prev) => [
            ...prev,
            {
              id: `e-p1-${tempId}`,
              source: parentId,
              sourceHandle: 'bottom',
              target: tempNodeId,
              targetHandle: 'p1',
              type: 'deletable',
            },
            {
              id: `e-par-${tempParId}`,
              source: tempNodeId,
              target: childId,
              targetHandle: 'top',
              type: 'deletable',
            },
          ])
          startTransition(async () => {
            await addExistingChild(treeId, parentId, childId, { x: unionX, y: unionY })
            router.refresh()
          })
        }
      } else if (isSourceUnion && !isTargetUnion) {
        // Existing union → child
        const unionId = source.replace('union-', '')
        const tempParId = crypto.randomUUID()
        setEdges((prev) => [
          ...prev,
          { id: `e-par-${tempParId}`, source, target, targetHandle: 'top', type: 'deletable' },
        ])
        startTransition(async () => {
          const result = await addChild(unionId, target)
          if (!result.success) {
            toast.error(result.error)
            setEdges((prev) => prev.filter((e) => e.id !== `e-par-${tempParId}`))
            return
          }
          router.refresh()
        })
      } else if (!isSourceUnion && isTargetUnion) {
        // Person → existing union (child of union)
        const unionId = target.replace('union-', '')
        const tempParId = crypto.randomUUID()
        setEdges((prev) => [
          ...prev,
          {
            id: `e-par-${tempParId}`,
            source: target,
            target: source,
            targetHandle: 'top',
            type: 'deletable',
          },
        ])
        startTransition(async () => {
          const result = await addChild(unionId, source)
          if (!result.success) {
            toast.error(result.error)
            setEdges((prev) => prev.filter((e) => e.id !== `e-par-${tempParId}`))
            return
          }
          router.refresh()
        })
      }
    },
    [nodes, treeId, router, startTransition, setNodes, setEdges]
  )

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
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#D4C9B5" />
      </ReactFlow>

      {/* Transparent backdrop — closes any open sidebar on outside click */}
      {(personDetail ?? sidebar ?? (showAddPerson || null)) && (
        <div
          className="absolute inset-0 z-[9]"
          onClick={() => {
            setPersonDetail(null)
            setPersonKinship(null)
            setSidebar(null)
            setShowAddPerson(false)
          }}
        />
      )}

      {personDetail && (
        <PersonDetailSidebar
          person={personDetail}
          kinship={personKinship ?? undefined}
          onClose={() => {
            setPersonDetail(null)
            setPersonKinship(null)
          }}
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
          onDelete={() => {
            const personId = personDetail.id
            setPersonDetail(null)
            setPersonKinship(null)
            setNodes((prev) => prev.filter((n) => n.id !== personId))
            setEdges((prev) => prev.filter((e) => e.source !== personId && e.target !== personId))
            startTransition(async () => {
              await deletePerson(personId)
              router.refresh()
            })
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
        <AddPersonSidebar treeId={treeId} onClose={() => setShowAddPerson(false)} />
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
