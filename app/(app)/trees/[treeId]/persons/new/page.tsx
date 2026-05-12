import { createPerson } from '@/server/persons'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewPersonPage({ params }: { params: Promise<{ treeId: string }> }) {
  const { treeId } = await params

  async function action(formData: FormData) {
    'use server'
    const person = await createPerson(treeId, {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string || undefined,
      gender: (formData.get('gender') as 'male' | 'female' | 'other' | 'unknown') ?? 'unknown',
      birthDate: formData.get('birthDate') as string || undefined,
      birthPlace: formData.get('birthPlace') as string || undefined,
      deathDate: formData.get('deathDate') as string || undefined,
      deathPlace: formData.get('deathPlace') as string || undefined,
      isAlive: formData.get('isAlive') !== 'false',
      bio: formData.get('bio') as string || undefined,
    })
    redirect(`/trees/${treeId}/persons/${person.id}`)
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link
        href={`/trees/${treeId}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tree
      </Link>

      <h1 className="text-xl font-semibold text-stone-800 mb-6">Add person</h1>

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">First name *</label>
            <input name="firstName" required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Last name</label>
            <input name="lastName" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Gender</label>
          <select name="gender" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Birth date</label>
            <input name="birthDate" type="date" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Birth place</label>
            <input name="birthPlace" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Death date</label>
            <input name="deathDate" type="date" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Death place</label>
            <input name="deathPlace" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
          <textarea name="bio" rows={3} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none" />
        </div>

        <button
          type="submit"
          className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Add person
        </button>
      </form>
    </div>
  )
}
