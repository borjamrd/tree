import { createPerson } from '@/server/persons'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PersonForm } from '@/components/person/PersonForm'
import type { PersonInput } from '@/lib/validations'

export default async function NewPersonPage({ params }: { params: Promise<{ treeId: string }> }) {
  const { treeId } = await params

  async function action(data: PersonInput) {
    'use server'
    return createPerson(treeId, data)
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link href={`/trees/${treeId}`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to tree
      </Link>

      <h1 className="text-xl font-semibold text-stone-800 mb-6">Add person</h1>

      <PersonForm
        treeId={treeId}
        action={action}
        submitLabel="Add person"
      />
    </div>
  )
}
