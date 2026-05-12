'use client'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

type PersonData = {
  id: string
  treeId: string
  firstName: string
  lastName?: string | null
  birthDate?: string | null
  deathDate?: string | null
  photoUrl?: string | null
  onAddRelative?: (personId: string) => void
}

export function PersonNode({ data, positionAbsoluteX, positionAbsoluteY }: NodeProps) {
  const d = data as PersonData

  function handleAddRelative(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    d.onAddRelative?.(d.id)
  }

  return (
    <div className="group w-40 rounded-xl border border-stone-200 bg-white shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
      <Handle type="target" position={Position.Top} />

      {d.photoUrl && (
        <div
          className="w-10 h-10 rounded-full mx-auto mb-2 bg-cover bg-center border border-stone-100"
          style={{ backgroundImage: `url(${d.photoUrl})` }}
        />
      )}

      <Link
        href={`/trees/${d.treeId}/persons/${d.id}`}
        className="block"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-center text-stone-800 truncate hover:underline">
          {d.firstName} {d.lastName}
        </p>
        {d.birthDate && (
          <p className="text-xs text-stone-400 text-center mt-0.5">
            {d.birthDate}{d.deathDate ? ` – ${d.deathDate}` : ''}
          </p>
        )}
      </Link>

      <button
        onClick={handleAddRelative}
        className="absolute -top-2 -right-2 w-6 h-6 bg-stone-800 rounded-full items-center justify-center hidden group-hover:flex hover:bg-stone-600 transition-colors shadow-sm"
        title="Add relative"
      >
        <UserPlus className="w-3 h-3 text-white" />
      </button>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
