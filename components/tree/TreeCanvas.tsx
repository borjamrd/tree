'use client'
import { useCallback, useEffect, useState, useTransition } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type OnNodesChange,
  type NodeChange,
  type Connection,
  applyNodeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useRouter } from 'next/navigation'
import { PersonNode } from './PersonNode'
import { UnionNode } from './UnionNode'
import { DeletableEdge } from './DeletableEdge'
import { RelativeSidebar } from './RelativeSidebar'
import { treeToFlow } from '@/lib/tree-transform'
import { updatePersonPosition } from '@/server/persons'
import { createUnion, addChild, deleteUnion, removeChild } from '@/server/relationships'

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
    setSidebar({
      personId,
      firstName: d.firstName,
      lastName: d.lastName,
      position: node.position,
    })
  }, [nodes])

  // Inject callback into person node data
  const nodesWithCallback = nodes.map((n) =>
    n.type === 'person'
      ? { ...n, data: { ...n.data, onAddRelative: handleAddRelative } }
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
      if (id.startsWith('union-')) return
      clearTimeout(positionTimer)
      positionTimer = setTimeout(() => {
        updatePersonPosition(id, position!.x, position!.y)
      }, 500)
    }
  }, [setNodes])

  const onConnect = useCallback((connection: Connection) => {
    const { source, target } = connection
    if (!source || !target) return

    const isSourceUnion = source.startsWith('union-')
    const isTargetUnion = target.startsWith('union-')

    startTransition(async () => {
      if (!isSourceUnion && !isTargetUnion) {
        const sourceNode = nodes.find((n) => n.id === source)
        const targetNode = nodes.find((n) => n.id === target)
        const posX = String(((sourceNode?.position.x ?? 0) + (targetNode?.position.x ?? 0)) / 2)
        const posY = String(Math.max(sourceNode?.position.y ?? 0, targetNode?.position.y ?? 0) + 120)
        await createUnion(treeId, source, target, 'unknown', posX, posY)
        router.refresh()
      } else if (isSourceUnion && !isTargetUnion) {
        const unionId = source.replace('union-', '')
        await addChild(unionId, target)
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
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>

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
