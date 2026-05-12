import { createPerson } from '@/server/persons'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
      <Link href={`/trees/${treeId}`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to tree
      </Link>

      <h1 className="text-xl font-semibold text-stone-800 mb-6">Add person</h1>

      <form action={action} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name *</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            className="flex h-9 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="birthDate">Birth date</Label>
            <Input id="birthDate" name="birthDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birthPlace">Birth place</Label>
            <Input id="birthPlace" name="birthPlace" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="deathDate">Death date</Label>
            <Input id="deathDate" name="deathDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deathPlace">Death place</Label>
            <Input id="deathPlace" name="deathPlace" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" rows={3} />
        </div>

        <Button type="submit" className="w-full">Add person</Button>
      </form>
    </div>
  )
}
