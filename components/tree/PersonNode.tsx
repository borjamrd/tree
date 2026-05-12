'use client'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import Image from 'next/image'
import Link from 'next/link'

export function PersonNode({ data }: NodeProps) {
  const d = data as {
    id: string
    treeId: string
    firstName: string
    lastName?: string | null
    birthDate?: string | null
    deathDate?: string | null
    photoUrl?: string | null
  }

  return (
    <Link href={`/trees/${d.treeId}/persons/${d.id}`}>
      <div className="w-40 rounded-xl border border-stone-200 bg-white shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow">
        <Handle type="target" position={Position.Top} />
        {d.photoUrl && (
          <div className="w-10 h-10 rounded-full mx-auto mb-2 overflow-hidden relative">
            <Image src={d.photoUrl} alt={d.firstName} fill className="object-cover" />
          </div>
        )}
        <p className="text-sm font-medium text-center text-stone-800 truncate">
          {d.firstName} {d.lastName}
        </p>
        {d.birthDate && (
          <p className="text-xs text-stone-400 text-center mt-0.5">
            {d.birthDate}{d.deathDate ? ` – ${d.deathDate}` : ''}
          </p>
        )}
        <Handle type="source" position={Position.Bottom} />
      </div>
    </Link>
  )
}
