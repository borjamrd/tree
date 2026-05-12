'use client'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { X } from 'lucide-react'
import { deleteUnion } from '@/server/relationships'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function UnionNode({ id, data }: NodeProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const unionId = id.replace('union-', '')

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    startTransition(async () => {
      await deleteUnion(unionId)
      router.refresh()
    })
  }

  return (
    <div className="relative group">
      <div className="w-4 h-4 rounded-full bg-stone-400 border-2 border-white shadow flex items-center justify-center">
        <Handle type="target" id="p1" position={Position.Top} className="opacity-0" />
        <Handle type="target" id="p2" position={Position.Top} className="opacity-0" />
        <Handle type="source" position={Position.Bottom} className="opacity-0" />
      </div>

      <button
        onClick={handleDelete}
        disabled={pending}
        className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 rounded-full items-center justify-center hidden group-hover:flex hover:bg-red-500 transition-colors"
      >
        <X className="w-2.5 h-2.5 text-white" />
      </button>
    </div>
  )
}
