import { db } from '@/lib/db'
import { persons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '@/lib/get-session'
import { notFound } from 'next/navigation'
import { updatePerson } from '@/server/persons'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, History } from 'lucide-react'
import { PersonForm } from '@/components/person/PersonForm'
import type { PersonInput } from '@/lib/validations'
import { getTranslations } from 'next-intl/server'

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ treeId: string; personId: string }>
}) {
  const { treeId, personId } = await params
  const user = await requireUser()
  const t = await getTranslations('editPersonPage')

  const person = await db.query.persons.findFirst({
    where: eq(persons.id, personId),
    with: { tree: true },
  })

  if (!person || person.tree.userId !== user.id) notFound()

  async function action(data: PersonInput) {
    'use server'
    return updatePerson(personId, data)
  }

  return (
    <div className="min-h-screen bg-[#F2EDE3] selection:bg-stone-200/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="max-w-3xl mx-auto relative z-10">
        <Link
          href={`/trees/${treeId}/persons/${personId}`}
          className="group inline-flex items-center gap-3 text-stone-400 hover:text-stone-800 transition-all duration-500 mb-12 animate-fade-in"
        >
          <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-stone-400 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-body text-[10px] uppercase tracking-[0.2em] font-semibold">
            {t('back')}
          </span>
        </Link>

        <div className="bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2px] p-8 sm:p-16 relative border border-stone-100 animate-fade-up">
          {/* Header */}
          <header className="mb-16">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-3.5 h-3.5 text-stone-300" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">
                Record Modification
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-medium text-stone-900 leading-tight italic tracking-tight">
              {t('title')}
            </h1>
            <div className="h-px w-24 bg-stone-900 mt-6" />
          </header>

          <PersonForm
            treeId={treeId}
            personId={personId}
            defaultValues={{
              firstName: person.firstName,
              lastName: person.lastName ?? undefined,
              lastName2: person.lastName2 ?? undefined,
              gender: person.gender,
              birthDate: person.birthDate ?? undefined,
              birthPlace: person.birthPlace ?? undefined,
              deathDate: person.deathDate ?? undefined,
              deathPlace: person.deathPlace ?? undefined,
              bio: person.bio ?? undefined,
              photoUrl: person.photoUrl ?? undefined,
            }}
            action={action}
            submitLabel={t('submitLabel')}
          />
        </div>

        <footer className="mt-12 text-center pb-12 animate-fade-in delay-700">
          <p className="text-[10px] text-stone-400 font-medium tracking-[0.4em] uppercase">
            Documenting the {person.tree.name} History
          </p>
        </footer>
      </div>
    </div>
  )
}
