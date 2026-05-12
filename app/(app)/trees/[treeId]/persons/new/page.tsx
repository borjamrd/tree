import { createPerson } from '@/server/persons'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PersonForm } from '@/components/person/PersonForm'

export default async function NewPersonPage({ params }: { params: Promise<{ treeId: string }> }) {
  const { treeId } = await params

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link href={`/trees/${treeId}`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to tree
      </Link>

      <h1 className="text-xl font-semibold text-stone-800 mb-6">Add person</h1>

      <PersonForm
        treeId={treeId}
        action={(data) => createPerson(treeId, data)}
        submitLabel="Add person"
      />
    </div>
  )
}
