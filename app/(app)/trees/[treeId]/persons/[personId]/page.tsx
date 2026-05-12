import { db } from '@/lib/db'
import { persons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { devSession } from '@/lib/dev-session'
import { notFound } from 'next/navigation'
import { PersonCard } from '@/components/person/PersonCard'
import { DeletePersonButton } from '@/components/person/DeletePersonButton'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href={`/trees/${treeId}`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to tree
      </Link>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-800">
          {[person.firstName, person.lastName, person.lastName2].filter(Boolean).join(' ')}
        </h1>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/trees/${treeId}/persons/${personId}/edit`}>
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
        </Button>
      </div>

      <PersonCard person={person} />

      <div className="mt-8 border-t border-stone-100 pt-6">
        <DeletePersonButton personId={personId} treeId={treeId} />
      </div>
    </div>
  )
}
