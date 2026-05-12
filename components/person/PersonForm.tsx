'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@/i18n/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { personSchema, type PersonInput } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, User, MapPin, Camera, AlignLeft, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  treeId: string
  personId?: string
  defaultValues?: Partial<PersonInput>
  action: (input: PersonInput) => Promise<{ success: true; data?: { id: string } | unknown } | { success: false; error: string }>
  submitLabel: string
  redirectTo?: string
}

export function PersonForm({ treeId, personId, defaultValues, action, submitLabel, redirectTo }: Props) {
  const t = useTranslations('personForm')
  const tCommon = useTranslations('common')
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
        toast.success(personId ? t('successUpdate') : t('successAdd'))
        const id = (result.data as { id?: string } | undefined)?.id ?? personId ?? ''
        router.push(redirectTo ? redirectTo.replace('[id]', id) : `/trees/${treeId}/persons/${id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const { register, handleSubmit, formState: { errors } } = form

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-6 mt-8 first:mt-0">
      <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 group-focus-within/section:text-stone-900 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 group-focus-within/section:text-stone-600 transition-colors">{title}</h3>
    </div>
  )

  const InputWrapper = ({ label, id, error, children, className }: any) => (
    <div className={cn("space-y-2 group/field", className)}>
      <Label 
        htmlFor={id} 
        className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 group-focus-within/field:text-stone-900 transition-colors duration-300"
      >
        {label}
      </Label>
      <div className="relative">
        {children}
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-stone-900 w-0 group-focus-within/field:w-full transition-all duration-500 ease-out" 
        />
      </div>
      {error && <p className="text-[10px] font-medium text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Identity Section */}
      <section className="group/section">
        <SectionTitle icon={User} title="Identity" />
        <div className="space-y-6">
          <InputWrapper label={t('firstName')} id="firstName" error={errors.firstName?.message}>
            <Input 
              id="firstName" 
              {...register('firstName')} 
              className="bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 text-lg font-display placeholder:text-stone-200 focus-visible:ring-0 focus-visible:border-stone-900 transition-all"
              placeholder="e.g. Eleanor"
            />
          </InputWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputWrapper label={t('lastName')} id="lastName">
              <Input 
                id="lastName" 
                {...register('lastName')} 
                className="bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 placeholder:text-stone-200 focus-visible:ring-0 focus-visible:border-stone-900 transition-all"
                placeholder="Primary surname"
              />
            </InputWrapper>
            <InputWrapper label={t('lastName2')} id="lastName2">
              <Input 
                id="lastName2" 
                {...register('lastName2')} 
                className="bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 placeholder:text-stone-200 focus-visible:ring-0 focus-visible:border-stone-900 transition-all"
                placeholder="Secondary surname"
              />
            </InputWrapper>
          </div>

          <InputWrapper label={t('gender')} id="gender">
            <div className="relative">
              <select
                id="gender"
                {...register('gender')}
                className="appearance-none w-full bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 text-sm focus:outline-none focus:border-stone-900 transition-all cursor-pointer"
              >
                <option value="unknown">{t('genderUnknown')}</option>
                <option value="male">{t('genderMale')}</option>
                <option value="female">{t('genderFemale')}</option>
                <option value="other">{t('genderOther')}</option>
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          </InputWrapper>
        </div>
      </section>

      {/* Life Timeline Section */}
      <section className="group/section">
        <SectionTitle icon={Calendar} title="Life Timeline" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <InputWrapper label={t('birthDate')} id="birthDate">
            <Input 
              id="birthDate" 
              type="date" 
              {...register('birthDate')} 
              className="bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-stone-900 transition-all"
            />
          </InputWrapper>
          <InputWrapper label={t('birthPlace')} id="birthPlace">
            <div className="relative">
              <Input 
                id="birthPlace" 
                {...register('birthPlace')} 
                className="bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 pl-6 focus-visible:ring-0 focus-visible:border-stone-900 transition-all"
                placeholder="City, Country"
              />
              <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
            </div>
          </InputWrapper>

          <InputWrapper label={t('deathDate')} id="deathDate">
            <Input 
              id="deathDate" 
              type="date" 
              {...register('deathDate')} 
              className="bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-stone-900 transition-all opacity-70 focus:opacity-100 transition-opacity"
            />
          </InputWrapper>
          <InputWrapper label={t('deathPlace')} id="deathPlace">
            <div className="relative">
              <Input 
                id="deathPlace" 
                {...register('deathPlace')} 
                className="bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 pl-6 focus-visible:ring-0 focus-visible:border-stone-900 transition-all opacity-70 focus:opacity-100 transition-opacity"
                placeholder="Resting place"
              />
              <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
            </div>
          </InputWrapper>
        </div>
      </section>

      {/* Media & Narrative Section */}
      <section className="group/section">
        <SectionTitle icon={AlignLeft} title="Media & Narrative" />
        <div className="space-y-8">
          <InputWrapper label={t('photoUrl')} id="photoUrl" error={errors.photoUrl?.message}>
            <div className="relative">
              <Input 
                id="photoUrl" 
                type="url" 
                placeholder={t('photoUrlPlaceholder')} 
                {...register('photoUrl')} 
                className="bg-transparent border-0 border-b border-stone-100 rounded-none px-0 h-10 pl-6 focus-visible:ring-0 focus-visible:border-stone-900 transition-all"
              />
              <Camera className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
            </div>
          </InputWrapper>

          <InputWrapper label={t('bio')} id="bio">
            <Textarea 
              id="bio" 
              rows={4} 
              {...register('bio')} 
              className="bg-stone-50/50 border-0 border-stone-100 rounded-2xl p-4 text-sm focus-visible:ring-2 focus-visible:ring-stone-900/5 transition-all resize-none italic"
              placeholder="Capture the essence of their story..."
            />
          </InputWrapper>
        </div>
      </section>

      <div className="pt-8">
        <button 
          type="submit" 
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 py-3.5 transition-colors duration-150 disabled:opacity-50"
          style={{
            border: '1px solid var(--rule)',
            background: 'transparent',
            color: 'var(--sepia)',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 500,
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
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
