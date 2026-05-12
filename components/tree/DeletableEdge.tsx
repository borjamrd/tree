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
      <path
        d={edgePath}
        stroke="transparent"
        strokeWidth={16}
        fill="none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <BaseEdge id={id} path={edgePath} style={{ stroke: '#d6d3d1', strokeWidth: 1.5 }} />
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
              className="w-5 h-5 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center shadow transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
