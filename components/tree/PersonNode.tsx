'use client'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

type PersonData = {
  id: string
  treeId: string
  firstName: string
  lastName?: string | null
  lastName2?: string | null
  gender?: string | null
  birthDate?: string | null
  deathDate?: string | null
  photoUrl?: string | null
  onAddRelative?: (personId: string) => void
}

function accentColor(gender?: string | null) {
  if (gender === 'male')   return '#C4A252' // gold
  if (gender === 'female') return '#9E7B5A' // dark sepia
  return '#D4C9B5'                          // rule
}

const handleCls = (color: string) =>
  `!transition-opacity !border-[var(--parchment)] !w-2 !h-2 !opacity-0 group-hover:!opacity-80`

export function PersonNode({ data }: NodeProps) {
  const d = data as PersonData
  const accent = accentColor(d.gender)
  const fullName = [d.firstName, d.lastName, d.lastName2].filter(Boolean).join(' ')

  function handleAddRelative(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    d.onAddRelative?.(d.id)
  }

  return (
    <div
      className="group relative w-44 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: 'var(--parchment)',
        border: '1px solid var(--rule)',
        boxShadow: '0 2px 12px rgba(28,21,16,0.07), 0 1px 3px rgba(28,21,16,0.04)',
      }}
    >
      {/* Gender accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />

      <Handle
        type="source" id="top" position={Position.Top} title="Add parent"
        className={`${handleCls(accent)} !bg-[var(--sepia)]`}
      />
      <Handle
        type="source" id="left" position={Position.Left} title="Add partner"
        className={`${handleCls(accent)} !bg-[var(--gold)]`}
      />
      <Handle
        type="source" id="right" position={Position.Right} title="Add partner"
        className={`${handleCls(accent)} !bg-[var(--gold)]`}
      />

      <div className="pl-4 pr-3 pt-3 pb-3">
        {/* Avatar */}
        {d.photoUrl ? (
          <div
            className="w-9 h-9 rounded-full mx-auto mb-2.5 bg-cover bg-center"
            style={{ backgroundImage: `url(${d.photoUrl})`, border: '1.5px solid var(--rule)' }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full mx-auto mb-2.5 flex items-center justify-center"
            style={{ background: 'var(--parchment-mid)', border: '1px solid var(--rule)' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 300,
                color: 'var(--sepia)',
                lineHeight: 1,
              }}
            >
              {d.firstName.charAt(0)}
            </span>
          </div>
        )}

        {/* Name & dates */}
        <Link
          href={`/trees/${d.treeId}/persons/${d.id}`}
          className="block hover:opacity-60 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <p
            className="text-center truncate leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13.5px',
              fontWeight: 400,
              color: 'var(--ink)',
              letterSpacing: '0.01em',
            }}
          >
            {fullName}
          </p>
          {(d.birthDate || d.deathDate) && (
            <p
              className="text-center mt-0.5"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: 'var(--sepia)',
                letterSpacing: '0.04em',
              }}
            >
              {d.birthDate ?? '?'}
              {d.deathDate ? ` – ${d.deathDate}` : ''}
            </p>
          )}
        </Link>
      </div>

      {/* Add relative button */}
      <button
        onClick={handleAddRelative}
        className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full hidden group-hover:flex items-center justify-center shadow-sm transition-colors"
        style={{ background: 'var(--ink)' }}
        title="Add relative"
      >
        <Plus className="w-3 h-3" style={{ color: 'var(--parchment)' }} />
      </button>

      <Handle
        type="source" id="bottom" position={Position.Bottom} title="Add child"
        className={`${handleCls(accent)} !bg-[var(--sepia)]`}
      />
    </div>
  )
}
