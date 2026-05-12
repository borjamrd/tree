'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { personSchema, type PersonInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  treeId: string
  personId?: string
  defaultValues?: Partial<PersonInput>
  action: (input: PersonInput) => Promise<{ success: true; data?: { id: string } | unknown } | { success: false; error: string }>
  submitLabel: string
  redirectTo?: (id: string) => string
}

export function PersonForm({ treeId, personId, defaultValues, action, submitLabel, redirectTo }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      gender: 'unknown',
      isAlive: true,
      ...defaultValues,
    },
  })

  function onSubmit(data: PersonInput) {
    startTransition(async () => {
      const result = await action(data)
      if (result.success) {
        toast.success(personId ? 'Person updated' : 'Person added')
        const id = (result.data as { id?: string } | undefined)?.id ?? personId ?? ''
        router.push(redirectTo ? redirectTo(id) : `/trees/${treeId}/persons/${id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const { register, handleSubmit, formState: { errors } } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name *</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" {...register('lastName')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          {...register('gender')}
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
          <Input id="birthDate" type="date" {...register('birthDate')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="birthPlace">Birth place</Label>
          <Input id="birthPlace" {...register('birthPlace')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="deathDate">Death date</Label>
          <Input id="deathDate" type="date" {...register('deathDate')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deathPlace">Death place</Label>
          <Input id="deathPlace" {...register('deathPlace')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input id="photoUrl" type="url" placeholder="https://…" {...register('photoUrl')} />
        {errors.photoUrl && <p className="text-xs text-red-500">{errors.photoUrl.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={3} {...register('bio')} />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
