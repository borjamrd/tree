'use client'
import { X, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { personSchema, type PersonInput } from '@/lib/validations'
import { createPerson } from '@/server/persons'

type Props = {
  treeId: string
  onClose: () => void
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '9px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--rule)',
  marginBottom: 4,
}

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

export function AddPersonSidebar({ treeId, onClose }: Props) {
  const t = useTranslations('treePage')
  const tForm = useTranslations('personForm')
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
    defaultValues: { gender: 'unknown', isAlive: true },
  })

  function onSubmit(data: PersonInput) {
    startTransition(async () => {
      const result = await createPerson(treeId, data)
      if (result.success) {
        toast.success(tForm('successAdd'))
        reset()
        router.refresh()
        onClose()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div
      className="absolute top-0 right-0 h-full flex flex-col z-10"
      style={{
        width: 320,
        background: 'var(--parchment)',
        borderLeft: '1px solid var(--rule)',
        boxShadow: '-4px 0 24px rgba(28,21,16,0.06)',
      }}
    >
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: '#D4C9B5' }} />

      {/* Header */}
      <div className="pl-5 pr-4 pt-5 pb-4" style={{ borderBottom: '1px solid var(--rule)' }}>
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 w-9 h-9 flex items-center justify-center"
            style={{
              border: '1px solid var(--rule)',
              color: 'var(--sepia)',
            }}
          >
            <UserPlus className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <span style={labelStyle}>{t('newMember')}</span>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                fontWeight: 400,
                color: 'var(--ink)',
                letterSpacing: '0.01em',
                lineHeight: 1.2,
              }}
            >
              {t('addPerson')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-sm transition-opacity hover:opacity-50 shrink-0"
            style={{
              border: '1px solid var(--rule)',
              color: 'var(--rule)',
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <form id="add-person-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* First name */}
          <div>
            <label style={labelStyle}>{tForm('firstName')}</label>
            <input
              {...register('firstName')}
              placeholder="e.g. Eleanor"
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

          {/* Last names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>{tForm('lastName')}</label>
              <input
                {...register('lastName')}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>{tForm('lastName2')}</label>
              <input
                {...register('lastName2')}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label style={labelStyle}>{tForm('gender')}</label>
            <select
              {...register('gender')}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
            >
              <option value="unknown">{tForm('genderUnknown')}</option>
              <option value="male">{tForm('genderMale')}</option>
              <option value="female">{tForm('genderFemale')}</option>
              <option value="other">{tForm('genderOther')}</option>
            </select>
          </div>

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: 'var(--rule)', borderRadius: 0.5 }} />
            <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
          </div>

          {/* Birth */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>{tForm('birthDate')}</label>
              <input
                type="date"
                {...register('birthDate')}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--sepia)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--rule)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>{tForm('birthPlace')}</label>
              <input
                {...register('birthPlace')}
                style={inputStyle}
                placeholder="Ciudad, País"
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
          form="add-person-form"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 py-2.5 transition-colors duration-150"
          style={{
            border: '1px solid var(--rule)',
            background: 'transparent',
            color: 'var(--sepia)',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!pending) {
              e.currentTarget.style.borderColor = 'var(--ink)'
              e.currentTarget.style.color = 'var(--ink)'
            }
          }}
          onMouseLeave={(e) => {
            if (!pending) {
              e.currentTarget.style.borderColor = 'var(--rule)'
              e.currentTarget.style.color = 'var(--sepia)'
            }
          }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          {pending ? '…' : t('addPerson')}
        </button>
      </div>
    </div>
  )
}
