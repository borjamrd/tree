'use client'
import { useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react'
import { X } from 'lucide-react'

type Data = { onDelete?: () => void }

export function DeletableEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const [hovered, setHovered] = useState(false)
  const d = data as Data | undefined
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  return (
    <>
      {/* Invisible wide hit area */}
      <path
        d={edgePath}
        stroke="transparent"
        strokeWidth={16}
        fill="none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: hovered ? 'var(--sepia)' : 'var(--rule)',
          strokeWidth: hovered ? 1.5 : 1,
          transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
        }}
      />
      {hovered && d?.onDelete && (
        <EdgeLabelRenderer>
          <div
            className="absolute nodrag nopan pointer-events-auto"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <button
              onClick={d.onDelete}
              className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm transition-colors"
              style={{ background: 'var(--ink)' }}
              title="Remove connection"
            >
              <X className="w-2.5 h-2.5" style={{ color: 'var(--parchment)' }} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
