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
import { PersonNode } from './PersonNode'
import { UnionNode } from './UnionNode'
import { DeletableEdge } from './DeletableEdge'
import { RelativeSidebar } from './RelativeSidebar'
import { PersonDetailSidebar, type PersonDetail } from './PersonDetailSidebar'
import { treeToFlow } from '@/lib/tree-transform'
import { updatePersonPosition } from '@/server/persons'
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
    setSidebar({
      personId,
      firstName: d.firstName,
      lastName: d.lastName,
      position: node.position,
    })
  }, [nodes])

  const handlePersonClick = useCallback((personId: string) => {
    const node = nodes.find((n) => n.id === personId)
    if (!node) return
    setSidebar(null)
    setPersonDetail(node.data as PersonDetail)
  }, [nodes])

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
      {(personDetail ?? sidebar) && (
        <div
          className="absolute inset-0 z-[9]"
          onClick={() => { setPersonDetail(null); setSidebar(null) }}
        />
      )}

      {personDetail && (
        <PersonDetailSidebar
          person={personDetail}
          onClose={() => setPersonDetail(null)}
          onAddRelative={() => {
            setSidebar({
              personId: personDetail.id,
              firstName: personDetail.firstName,
              lastName: personDetail.lastName,
              position: nodes.find((n) => n.id === personDetail.id)?.position ?? { x: 0, y: 0 },
            })
            setPersonDetail(null)
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
    </div>
  )
}
