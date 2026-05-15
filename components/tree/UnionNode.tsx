'use client'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { X } from 'lucide-react'

export function UnionNode({ data }: NodeProps) {
  const onDelete = (data as { onDelete?: () => void }).onDelete

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div className="relative group flex items-center justify-center w-4 h-4">
      <div
        style={{
          width: 10,
          height: 10,
          background: 'var(--gold)',
          transform: 'rotate(45deg)',
          border: '1.5px solid var(--parchment)',
          boxShadow: '0 2px 8px rgba(28,21,16,0.2)',
          transition: 'background 0.2s',
        }}
      />

      <Handle
        type="target"
        id="p1"
        position={Position.Top}
        className="!opacity-0 !w-full !h-full !rounded-none !border-none !bg-transparent !top-0 !left-0 !translate-x-0 !translate-y-0"
      />
      <Handle
        type="target"
        id="p2"
        position={Position.Top}
        className="!opacity-0 !w-full !h-full !rounded-none !border-none !bg-transparent !top-0 !left-0 !translate-x-0 !translate-y-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-full !h-full !rounded-none !border-none !bg-transparent !top-0 !left-0 !translate-x-0 !translate-y-0"
      />

      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-4 h-4 rounded-full hidden group-hover:flex items-center justify-center shadow-sm transition-colors"
        style={{ background: 'var(--ink)' }}
        title="Delete union"
      >
        <X className="w-2.5 h-2.5" style={{ color: 'var(--parchment)' }} />
      </button>
    </div>
  )
}
