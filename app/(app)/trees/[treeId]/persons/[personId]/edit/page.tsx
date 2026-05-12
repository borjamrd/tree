import { db } from '@/lib/db'
import { persons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { devSession } from '@/lib/dev-session'
import { notFound } from 'next/navigation'
import { updatePerson } from '@/server/persons'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PersonForm } from '@/components/person/PersonForm'

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ treeId: string; personId: string }>
}) {
  const { treeId, personId } = await params
  const { user } = devSession()

  const person = await db.query.persons.findFirst({
    where: eq(persons.id, personId),
    with: { tree: true },
  })

  if (!person || person.tree.userId !== user.id) notFound()

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link href={`/trees/${treeId}/persons/${personId}`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <h1 className="text-xl font-semibold text-stone-800 mb-6">Edit person</h1>

      <PersonForm
        treeId={treeId}
        personId={personId}
        defaultValues={{
          firstName: person.firstName,
          lastName: person.lastName ?? undefined,
          gender: person.gender,
          birthDate: person.birthDate ?? undefined,
          birthPlace: person.birthPlace ?? undefined,
          deathDate: person.deathDate ?? undefined,
          deathPlace: person.deathPlace ?? undefined,
          bio: person.bio ?? undefined,
          photoUrl: person.photoUrl ?? undefined,
        }}
        action={(data) => updatePerson(personId, data)}
        submitLabel="Save changes"
        redirectTo={() => `/trees/${treeId}/persons/${personId}`}
      />
    </div>
  )
}
