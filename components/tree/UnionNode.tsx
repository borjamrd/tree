'use client'
import { Handle, Position } from '@xyflow/react'

export function UnionNode() {
  return (
    <div className="w-3 h-3 rounded-full bg-stone-400 border-2 border-white shadow">
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
