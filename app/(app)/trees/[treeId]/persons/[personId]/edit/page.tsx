import { db } from '@/lib/db'
import { persons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { devSession } from '@/lib/dev-session'
import { notFound, redirect } from 'next/navigation'
import { updatePerson } from '@/server/persons'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

  async function action(formData: FormData) {
    'use server'
    await updatePerson(personId, {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string || undefined,
      gender: (formData.get('gender') as 'male' | 'female' | 'other' | 'unknown') ?? 'unknown',
      birthDate: formData.get('birthDate') as string || undefined,
      birthPlace: formData.get('birthPlace') as string || undefined,
      deathDate: formData.get('deathDate') as string || undefined,
      deathPlace: formData.get('deathPlace') as string || undefined,
      bio: formData.get('bio') as string || undefined,
    })
    redirect(`/trees/${treeId}/persons/${personId}`)
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link
        href={`/trees/${treeId}/persons/${personId}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <h1 className="text-xl font-semibold text-stone-800 mb-6">Edit person</h1>

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">First name *</label>
            <input name="firstName" defaultValue={person.firstName} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Last name</label>
            <input name="lastName" defaultValue={person.lastName ?? ''} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Gender</label>
          <select name="gender" defaultValue={person.gender} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Birth date</label>
            <input name="birthDate" type="date" defaultValue={person.birthDate ?? ''} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Birth place</label>
            <input name="birthPlace" defaultValue={person.birthPlace ?? ''} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Death date</label>
            <input name="deathDate" type="date" defaultValue={person.deathDate ?? ''} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Death place</label>
            <input name="deathPlace" defaultValue={person.deathPlace ?? ''} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
          <textarea name="bio" rows={3} defaultValue={person.bio ?? ''} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none" />
        </div>

        <button
          type="submit"
          className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
