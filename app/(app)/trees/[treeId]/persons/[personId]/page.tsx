import { db } from '@/lib/db'
import { persons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { devSession } from '@/lib/dev-session'
import { notFound, redirect } from 'next/navigation'
import { PersonCard } from '@/components/person/PersonCard'
import { deletePerson } from '@/server/persons'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'

export default async function PersonDetailPage({
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

  async function handleDelete() {
    'use server'
    await deletePerson(personId)
    redirect(`/trees/${treeId}`)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href={`/trees/${treeId}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tree
      </Link>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-800">
          {person.firstName} {person.lastName}
        </h1>
        <Link
          href={`/trees/${treeId}/persons/${personId}/edit`}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Link>
      </div>

      <PersonCard person={person} />

      <div className="mt-8 border-t border-stone-100 pt-6">
        <form action={handleDelete}>
          <button type="submit" className="text-sm text-red-400 hover:text-red-600 transition-colors">
            Delete person
          </button>
        </form>
      </div>
    </div>
  )
}
