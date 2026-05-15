import { db } from '@/lib/db'
import { persons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '@/lib/get-session'
import { notFound } from 'next/navigation'
import { PersonCard } from '@/components/person/PersonCard'
import { DeletePersonButton } from '@/components/person/DeletePersonButton'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, Pencil, MapPin, History, AlignLeft, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ treeId: string; personId: string }>
}) {
  const { treeId, personId } = await params
  const user = await requireUser()
  const t = await getTranslations('personDetailPage')

  const person = await db.query.persons.findFirst({
    where: eq(persons.id, personId),
    with: { tree: true },
  })

  if (!person || person.tree.userId !== user.id) notFound()

  const fullName = [person.firstName, person.lastName, person.lastName2].filter(Boolean).join(' ')

  return (
    <div className="min-h-screen bg-[#F2EDE3] selection:bg-stone-200/50 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-stone-200/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-amber-100/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation Bar */}
        <nav className="mb-16 flex items-center justify-between animate-fade-in">
          <Link
            href={`/trees/${treeId}`}
            className="group inline-flex items-center gap-4 text-stone-400 hover:text-stone-800 transition-all duration-500"
          >
            <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-stone-500 transition-colors shadow-sm">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-body text-[9px] uppercase tracking-[0.3em] font-bold text-stone-300 group-hover:text-stone-500 transition-colors">
                Return to
              </span>
              <span className="font-body text-[11px] uppercase tracking-[0.1em] font-bold">
                {t('backToTree')}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href={`/trees/${treeId}/persons/${personId}/edit`}
              className="group flex items-center gap-3 px-8 py-3 bg-stone-900 text-stone-50 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{t('editPerson')}</span>
            </Link>
          </div>
        </nav>

        {/* Main Document Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: The Dossier Content */}
          <div className="lg:col-span-8 bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] rounded-sm p-8 sm:p-20 relative border border-stone-100 animate-fade-up">
            {/* Archival Stamp */}
            <div className="absolute top-10 right-10 opacity-[0.15] pointer-events-none select-none rotate-12">
              <div className="border-4 border-stone-900 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-xl font-bold text-stone-900 tracking-tighter">VERIFIED</span>
                <span className="text-[10px] font-bold text-stone-900 -mt-1 tracking-widest">
                  {new Date().getFullYear()}
                </span>
              </div>
            </div>

            <header className="mb-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-stone-200" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-300">
                  Biographical Summary
                </span>
              </div>
              <h1 className="text-7xl sm:text-8xl font-display font-medium text-stone-950 leading-[0.85] italic tracking-tight mb-8">
                {fullName}
              </h1>
              <p className="font-body text-stone-500 text-sm tracking-[0.05em] leading-relaxed max-w-md">
                Formal entry within the{' '}
                <span className="text-stone-900 font-semibold">{person.tree.name}</span> family
                archives. Record maintained and verified for historical preservation.
              </p>
            </header>

            <div className="space-y-20">
              {/* Vital Chronology */}
              <section>
                <div className="flex items-center gap-2 mb-10">
                  <History className="w-4 h-4 text-stone-300" />
                  <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400">
                    Vital Chronology
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                  <div className="space-y-3 relative">
                    <div className="absolute -left-6 top-2 w-2 h-2 rounded-full border border-stone-200 bg-white" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-stone-300 block">
                      Date of Arrival
                    </span>
                    <p className="text-2xl font-display text-stone-900 italic">
                      {person.birthDate
                        ? new Date(person.birthDate).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Date Unknown'}
                    </p>
                    {person.birthPlace && (
                      <div className="flex items-center gap-2 text-stone-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-sm font-body italic">{person.birthPlace}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 relative">
                    <div className="absolute -left-6 top-2 w-2 h-2 rounded-full border border-stone-200 bg-white" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-stone-300 block">
                      Date of Departure
                    </span>
                    <p className="text-2xl font-display text-stone-900 italic">
                      {person.deathDate
                        ? new Date(person.deathDate).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Still Living'}
                    </p>
                    {person.deathPlace && (
                      <div className="flex items-center gap-2 text-stone-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-sm font-body italic">{person.deathPlace}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Personal Narrative */}
              {person.bio && (
                <section className="relative">
                  <div className="absolute -left-10 top-0 bottom-0 w-px bg-stone-50" />
                  <div className="flex items-center gap-2 mb-8">
                    <AlignLeft className="w-4 h-4 text-stone-300" />
                    <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400">
                      Historical Narrative
                    </h2>
                  </div>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-xl font-body text-stone-700 leading-relaxed italic first-letter:text-6xl first-letter:font-display first-letter:mr-4 first-letter:float-left first-letter:text-stone-950 first-letter:leading-[0.8] first-letter:pt-2">
                      {person.bio}
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Document Footer */}
            <footer className="mt-24 pt-12 border-t border-stone-50 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-[8px] font-bold text-stone-300"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-stone-300 max-w-[140px] leading-tight">
                  Archival Generation Tracked & Verified
                </p>
              </div>

              <DeletePersonButton personId={personId} treeId={treeId} />
            </footer>
          </div>

          {/* Right: The Portrait Card Artifact */}
          <aside className="lg:col-span-4 sticky top-12 animate-fade-in delay-300">
            <div className="space-y-8">
              <div className="flex items-center gap-3 px-2">
                <Sparkles className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">
                  Archival Artifact
                </span>
              </div>
              <PersonCard person={person} />

              <div className="p-8 bg-stone-900 rounded-sm text-stone-400 space-y-4 shadow-2xl shadow-stone-900/40">
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Record Identification
                </p>
                <div className="font-mono text-[11px] break-all leading-relaxed">
                  UID: {personId.toUpperCase()}
                  <br />
                  TREE: {treeId.slice(0, 8).toUpperCase()}
                </div>
                <div className="pt-4 border-t border-stone-800">
                  <p className="text-[9px] leading-relaxed italic">
                    "Every ancestor is a root that feeds the branches of our future."
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Final Footer */}
        <footer className="mt-24 text-center pb-16 animate-fade-in delay-700">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-stone-200" />
            <div className="w-2 h-2 rounded-full bg-stone-200" />
            <div className="h-px w-12 bg-stone-200" />
          </div>
          <p className="text-[10px] text-stone-400 font-medium tracking-[0.6em] uppercase">
            Treel &copy; 2026 &mdash; Perpetual Heritage
          </p>
        </footer>
      </div>
    </div>
  )
}
