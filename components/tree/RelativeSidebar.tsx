'use client'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X, Heart, Baby, User } from 'lucide-react'
import { personSchema, type PersonInput } from '@/lib/validations'
import { addRelative } from '@/server/relationships'

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

const RELATIONSHIPS: { value: RelationshipType; label: string; icon: React.ReactNode }[] = [
  { value: 'partner', label: 'Partner', icon: <Heart className="w-3.5 h-3.5" /> },
  { value: 'child',   label: 'Child',   icon: <Baby  className="w-3.5 h-3.5" /> },
  { value: 'parent',  label: 'Parent',  icon: <User  className="w-3.5 h-3.5" /> },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--parchment-mid)',
  border: '1px solid var(--rule)',
  borderRadius: 2,
  padding: '7px 10px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--ink)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '9px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--sepia)',
  marginBottom: 5,
}

export function RelativeSidebar({ treeId, anchorPerson, onClose, onSuccess }: Props) {
  const [relationship, setRelationship] = useState<RelationshipType>('partner')
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
    defaultValues: { gender: 'unknown', isAlive: true },
  })

  function onSubmit(data: PersonInput) {
    startTransition(async () => {
      const result = await addRelative(treeId, anchorPerson.id, relationship, data, anchorPerson.position)
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
    <div
      className="absolute top-0 right-0 h-full w-76 flex flex-col z-10"
      style={{
        width: 288,
        background: 'var(--parchment)',
        borderLeft: '1px solid var(--rule)',
        boxShadow: '-4px 0 24px rgba(28,21,16,0.06)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 400,
              color: 'var(--ink)',
              letterSpacing: '0.01em',
              marginBottom: 2,
            }}
          >
            Add Relative
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--sepia)',
              fontStyle: 'italic',
            }}
          >
            of {anchorName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="transition-opacity hover:opacity-50 mt-0.5"
          style={{ color: 'var(--rule)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Relationship selector */}
        <div>
          <span style={labelStyle}>Relationship</span>
          <div className="grid grid-cols-3 gap-2">
            {RELATIONSHIPS.map(({ value, label, icon }) => {
              const active = relationship === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRelationship(value)}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 transition-all duration-150"
                  style={{
                    border: active ? '1px solid var(--ink)' : '1px solid var(--rule)',
                    background: active ? 'var(--parchment-mid)' : 'var(--parchment)',
                    color: active ? 'var(--ink)' : 'var(--sepia)',
                    borderRadius: 2,
                  }}
                >
                  {icon}
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </span>
                  {active && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{ background: 'var(--rule)', borderRadius: 0.5 }}
          />
          <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
        </div>

        {/* Form */}
        <form id="relative-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label style={labelStyle}>First name *</label>
            <input
              {...register('firstName')}
              placeholder="First name"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
            />
            {errors.firstName && (
              <p style={{ fontSize: 10, color: '#b45309', marginTop: 3, fontFamily: 'var(--font-body)' }}>
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Primer apellido</label>
              <input
                {...register('lastName')}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Segundo apellido</label>
              <input
                {...register('lastName2')}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Gender</label>
            <select
              {...register('gender')}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
            >
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Birth date</label>
              <input
                type="date"
                {...register('birthDate')}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Birth place</label>
              <input
                {...register('birthPlace')}
                placeholder="City"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--rule)' }}>
        <button
          type="submit"
          form="relative-form"
          disabled={pending}
          className="w-full py-3 transition-colors duration-200"
          style={{
            background: pending ? 'var(--sepia)' : 'var(--ink)',
            color: 'var(--parchment)',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => { if (!pending) e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--ink)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = pending ? 'var(--sepia)' : 'var(--ink)'; e.currentTarget.style.color = 'var(--parchment)' }}
        >
          {pending ? 'Adding…' : `Add ${relationship}`}
        </button>
      </div>
    </div>
  )
}
