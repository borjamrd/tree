'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { toPng } from 'html-to-image'
import { Download, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Person = {
  id: string
  firstName: string
  lastName?: string | null
  lastName2?: string | null
  birthDate?: string | null
  birthPlace?: string | null
  deathDate?: string | null
  deathPlace?: string | null
  bio?: string | null
  photoUrl?: string | null
}

function _formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function PersonCard({ person }: { person: Person }) {
  const t = useTranslations('personCard')
  const cardRef = useRef<HTMLDivElement>(null)

  async function downloadCard() {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${person.firstName}-${person.lastName ?? ''}-archival-card.png`
      a.click()
    } catch (err) {
      console.error('Failed to export card', err)
    }
  }

  const fullName = [person.firstName, person.lastName, person.lastName2].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col items-center">
      <div
        ref={cardRef}
        className="w-80 bg-white p-8 font-body relative overflow-hidden shadow-2xl border-[12px] border-stone-100/50"
        style={{ minHeight: '480px' }}
      >
        {/* Subtle inner border */}
        <div className="absolute inset-4 border border-stone-200 pointer-events-none" />

        {/* Decorative Corners */}
        <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-stone-300" />
        <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-stone-300" />
        <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-stone-300" />
        <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-stone-300" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Portrait Area */}
          <div className="aspect-[4/5] bg-stone-50 border border-stone-200 mb-8 overflow-hidden relative grayscale-[0.2] sepia-[0.1]">
            {person.photoUrl ? (
              <Image
                src={person.photoUrl}
                alt={fullName}
                fill
                className="object-cover contrast-[1.05]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-200">
                <User className="w-16 h-16 stroke-[1]" />
              </div>
            )}
            {/* Vignette effect */}
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.05)] pointer-events-none" />
          </div>

          <div className="text-center space-y-4">
            <div>
              <h2 className="text-2xl font-display font-medium text-stone-900 leading-tight italic">
                {fullName}
              </h2>
              <div className="h-px w-12 bg-stone-200 mx-auto mt-3" />
            </div>

            <div className="space-y-1 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
              {person.birthDate && (
                <p>
                  {t('birth')}: {new Date(person.birthDate).getFullYear()}
                </p>
              )}
              {person.deathDate && (
                <p>
                  {t('death')}: {new Date(person.deathDate).getFullYear()}
                </p>
              )}
            </div>
          </div>

          {/* Bio Snippet */}
          {person.bio && (
            <div className="mt-auto pt-6">
              <p className="text-[11px] text-stone-500 leading-relaxed italic text-center line-clamp-3 px-2">
                &ldquo;{person.bio}&rdquo;
              </p>
            </div>
          )}

          {/* Footer Logo/Brand */}
          <div className="mt-8 pt-4 border-t border-stone-100 text-center">
            <span className="text-[8px] uppercase tracking-[0.4em] text-stone-300 font-bold">
              Treel Archival Series
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={downloadCard}
        className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-full border border-stone-200 text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-stone-900 hover:border-stone-900 transition-all group"
      >
        <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        {t('export')}
      </button>
    </div>
  )
}
