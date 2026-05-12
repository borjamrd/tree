'use client'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X, UserPlus, Heart, Baby, User } from 'lucide-react'
import { personSchema, type PersonInput } from '@/lib/validations'
import { addRelative } from '@/server/relationships'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type RelationshipType = 'partner' | 'child' | 'parent'

type Props = {
  treeId: string
  anchorPerson: {
    id: string
    firstName: string
    lastName?: string | null
    position: { x: number; y: number }
  }
  onClose: () => void
  onSuccess: () => void
}

const RELATIONSHIP_OPTIONS: {
  value: RelationshipType
  label: string
  icon: React.ReactNode
}[] = [
  { value: 'partner', label: 'Partner', icon: <Heart className="w-4 h-4" /> },
  { value: 'child',   label: 'Child',   icon: <Baby className="w-4 h-4" /> },
  { value: 'parent',  label: 'Parent',  icon: <User className="w-4 h-4" /> },
]

export function RelativeSidebar({ treeId, anchorPerson, onClose, onSuccess }: Props) {
  const [relationship, setRelationship] = useState<RelationshipType>('partner')
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
    defaultValues: { gender: 'unknown', isAlive: true },
  })

  function onSubmit(data: PersonInput) {
    startTransition(async () => {
      const result = await addRelative(
        treeId,
        anchorPerson.id,
        relationship,
        data,
        anchorPerson.position,
      )
      if (result.success) {
        toast.success(`${relationship.charAt(0).toUpperCase() + relationship.slice(1)} added`)
        reset()
        onSuccess()
      } else {
        toast.error(result.error)
      }
    })
  }

  const anchorName = [anchorPerson.firstName, anchorPerson.lastName].filter(Boolean).join(' ')

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white border-l border-stone-100 shadow-lg flex flex-col z-10">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-stone-500" />
          <span className="text-sm font-medium text-stone-800">Add relative</span>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <p className="text-xs text-stone-500">
          Relative of <span className="font-medium text-stone-700">{anchorName}</span>
        </p>

        <div className="space-y-2">
          <Label>Relationship</Label>
          <div className="grid grid-cols-3 gap-2">
            {RELATIONSHIP_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRelationship(value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-colors ${
                  relationship === value
                    ? 'border-stone-800 bg-stone-50 text-stone-800'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                {icon}
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <form id="relative-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="r-firstName">First name *</Label>
            <Input id="r-firstName" {...register('firstName')} placeholder="First name" />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-lastName">Last name</Label>
            <Input id="r-lastName" {...register('lastName')} placeholder="Last name" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-gender">Gender</Label>
            <select
              id="r-gender"
              {...register('gender')}
              className="flex h-9 w-full rounded-lg border border-stone-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            >
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="r-birthDate">Birth date</Label>
              <Input id="r-birthDate" type="date" {...register('birthDate')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-birthPlace">Birth place</Label>
              <Input id="r-birthPlace" {...register('birthPlace')} placeholder="City" />
            </div>
          </div>
        </form>
      </div>

      <div className="px-5 py-4 border-t border-stone-100">
        <Button type="submit" form="relative-form" className="w-full" disabled={pending}>
          {pending ? 'Adding…' : `Add ${relationship}`}
        </Button>
      </div>
    </div>
  )
}
