'use client'
import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnNodesChange,
  type NodeChange,
  applyNodeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PersonNode } from './PersonNode'
import { UnionNode } from './UnionNode'
import { treeToFlow } from '@/lib/tree-transform'
import { updatePersonPosition } from '@/server/persons'

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
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => treeToFlow(persons, unions, parentage),
    [persons, unions, parentage]
  )

  const [nodes, setNodes] = useNodesState(initialNodes)
  const [edges, setEdges] = useEdgesState(initialEdges)

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

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={(changes) => setEdges((eds) => eds)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}
