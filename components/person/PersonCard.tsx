'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'

type Person = {
  id: string
  firstName: string
  lastName?: string | null
  maidenName?: string | null
  birthDate?: string | null
  birthPlace?: string | null
  deathDate?: string | null
  deathPlace?: string | null
  bio?: string | null
  photoUrl?: string | null
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export function PersonCard({ person }: { person: Person }) {
  const cardRef = useRef<HTMLDivElement>(null)

  async function downloadCard() {
    if (!cardRef.current) return
    const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${person.firstName}-${person.lastName ?? ''}-card.png`
    a.click()
  }

  const fullName = [person.firstName, person.maidenName ? `(${person.maidenName})` : null, person.lastName]
    .filter(Boolean).join(' ')

  return (
    <div>
      <div
        ref={cardRef}
        className="w-72 bg-white rounded-2xl shadow-sm border border-stone-100 p-6 font-serif"
      >
        {person.photoUrl && (
          <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden relative">
            <Image src={person.photoUrl} alt={fullName} fill className="object-cover" />
          </div>
        )}

        <h2 className="text-lg font-semibold text-stone-800 text-center mb-1">{fullName}</h2>
        <div className="border-t border-stone-100 my-3" />

        <div className="space-y-2 text-sm">
          {person.birthDate && (
            <div className="flex gap-3">
              <span className="text-stone-400 w-10 shrink-0">Born</span>
              <span className="text-stone-700">
                {formatDate(person.birthDate)}
                {person.birthPlace && <><br /><span className="text-stone-500">{person.birthPlace}</span></>}
              </span>
            </div>
          )}
          {person.deathDate && (
            <div className="flex gap-3">
              <span className="text-stone-400 w-10 shrink-0">Died</span>
              <span className="text-stone-700">
                {formatDate(person.deathDate)}
                {person.deathPlace && <><br /><span className="text-stone-500">{person.deathPlace}</span></>}
              </span>
            </div>
          )}
          {person.bio && (
            <>
              <div className="border-t border-stone-100 my-3" />
              <p className="text-stone-500 text-xs line-clamp-3">{person.bio}</p>
            </>
          )}
        </div>
      </div>

      <button
        onClick={downloadCard}
        className="mt-3 flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
      >
        <Download className="w-3 h-3" />
        Export card
      </button>
    </div>
  )
}
