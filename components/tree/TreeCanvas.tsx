'use client'
import { useCallback, useEffect, useTransition } from 'react'
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
import { treeToFlow } from '@/lib/tree-transform'
import { updatePersonPosition } from '@/server/persons'
import { createUnion, addChild } from '@/server/relationships'

const nodeTypes = {
  person: PersonNode,
  union: UnionNode,
}

type Props = {
  treeId: string
  persons: Parameters<typeof treeToFlow>[0]
  unions: Parameters<typeof treeToFlow>[1]
  parentage: Parameters<typeof treeToFlow>[2]
}

let positionTimer: ReturnType<typeof setTimeout>

export function TreeCanvas({ treeId, persons, unions, parentage }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const { nodes: initialNodes, edges: initialEdges } = treeToFlow(persons, unions, parentage)
  const [nodes, setNodes] = useNodesState(initialNodes)
  const [edges, setEdges] = useEdgesState(initialEdges)

  // Sync when server data changes after router.refresh()
  useEffect(() => {
    const { nodes: freshNodes, edges: freshEdges } = treeToFlow(persons, unions, parentage)
    setNodes(freshNodes)
    setEdges(freshEdges)
  }, [persons, unions, parentage, setNodes, setEdges])

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
        // person → person: create union node between them
        const sourceNode = nodes.find((n) => n.id === source)
        const targetNode = nodes.find((n) => n.id === target)
        const posX = String(
          ((sourceNode?.position.x ?? 0) + (targetNode?.position.x ?? 0)) / 2
        )
        const posY = String(
          Math.max(sourceNode?.position.y ?? 0, targetNode?.position.y ?? 0) + 120
        )
        await createUnion(treeId, source, target, 'unknown', posX, posY)
        router.refresh()
      } else if (isSourceUnion && !isTargetUnion) {
        // union → person: add child
        const unionId = source.replace('union-', '')
        await addChild(unionId, target)
        router.refresh()
      }
    })
  }, [nodes, treeId, router, startTransition])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-xs text-stone-400 pointer-events-none select-none">
        Arrastra entre personas para crear una unión · Arrastra desde una unión a una persona para añadir un hijo
      </div>
    </div>
  )
}
