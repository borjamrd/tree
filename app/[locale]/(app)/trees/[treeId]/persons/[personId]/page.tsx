import { db } from '@/lib/db'
import { persons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '@/lib/get-session'
import { notFound } from 'next/navigation'
import { PersonCard } from '@/components/person/PersonCard'
import { DeletePersonButton } from '@/components/person/DeletePersonButton'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, Pencil, User, History } from 'lucide-react'
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
    <div className="min-h-screen bg-[#fdfcfb] selection:bg-stone-200/50">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-[#f5f2ee] rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="relative z-10 p-8 max-w-3xl mx-auto">
        <header className="mb-12">
          <Link 
            href={`/trees/${treeId}`} 
            className="group inline-flex items-center gap-3 text-stone-400 hover:text-stone-700 transition-all duration-300 mb-10"
          >
            <div 
              className="w-8 h-8 rounded-sm flex items-center justify-center transition-colors"
              style={{ border: '1px solid var(--rule)', color: 'var(--sepia)' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span 
              className="font-medium tracking-[0.14em] uppercase text-[10px]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {t('backToTree')}
            </span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-300 shadow-sm overflow-hidden">
                {person.photoUrl ? (
                  <img src={person.photoUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <History className="w-3 h-3 text-stone-300" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                    Individual Record
                  </p>
                </div>
                <h1 className="text-5xl font-display font-medium text-stone-900 leading-tight italic">
                  {fullName}
                </h1>
              </div>
            </div>

            <Link
              href={`/trees/${treeId}/persons/${personId}/edit`}
              className="group flex items-center justify-center gap-2 px-6 py-3 transition-all duration-150 rounded-sm self-start md:self-end"
              style={{
                border: '1px solid var(--rule)',
                background: 'transparent',
                color: 'var(--sepia)',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              <Pencil className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              <span>{t('editPerson')}</span>
            </Link>
          </div>
          <div className="h-px w-full bg-stone-100 mt-10" />
        </header>

        <main className="grid grid-cols-1 gap-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-[32px] border border-white/50 p-1 shadow-sm">
            <PersonCard person={person} />
          </div>

          <div className="flex justify-center pt-8 border-t border-stone-100">
            <DeletePersonButton personId={personId} treeId={treeId} />
          </div>
        </main>

        <footer className="mt-20 py-8 border-t border-stone-50 text-center">
          <p className="text-[10px] text-stone-300 font-medium tracking-widest uppercase italic">
            Part of the {person.tree.name} Lineage
          </p>
        </footer>
      </div>
    </div>
  )
}
