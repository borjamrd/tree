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
import {
  Calendar,
  User,
  MapPin,
  Camera,
  AlignLeft,
  Sparkles,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 mt-8 first:mt-0">
      <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 group-focus-within/section:text-stone-900 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 group-focus-within/section:text-stone-600 transition-colors">
        {title}
      </h3>
    </div>
  )
}

interface InputWrapperProps {
  label: string
  id: string
  error?: string
  children: React.ReactNode
  className?: string
}

function InputWrapper({ label, id, error, children, className }: InputWrapperProps) {
  return (
    <div className={cn('space-y-2 group/field', className)}>
      <Label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 group-focus-within/field:text-stone-900 transition-colors duration-300"
      >
        {label}
      </Label>
      <div className="relative">
        {children}
        <div className="absolute bottom-0 left-0 h-[2px] bg-stone-900 w-0 group-focus-within/field:w-full transition-all duration-500 ease-out" />
      </div>
      {error && (
        <p className="text-[10px] font-medium text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
}

type Props = {
  treeId: string
  personId?: string
  defaultValues?: Partial<PersonInput>
  action: (
    input: PersonInput
  ) => Promise<
    { success: true; data?: { id: string } | unknown } | { success: false; error: string }
  >
  submitLabel: string
  redirectTo?: string
  /** When provided, called after a successful submission instead of navigating away */
  onSuccess?: (id: string) => void
}

export function PersonForm({
  treeId,
  personId,
  defaultValues,
  action,
  submitLabel,
  redirectTo,
  onSuccess,
}: Props) {
  const t = useTranslations('personForm')
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
        if (onSuccess) {
          onSuccess(id)
        } else {
          router.push(
            redirectTo ? redirectTo.replace('[id]', id) : `/trees/${treeId}/persons/${id}`
          )
        }
      } else {
        toast.error(result.error)
      }
    })
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-16 animate-fade-in">
      {/* Identity Section */}
      <section className="relative">
        <div className="absolute -left-8 top-0 bottom-0 w-px bg-stone-200 hidden md:block" />
        <SectionTitle icon={User} title="Identification & Identity" />

        <div className="grid grid-cols-1 gap-10">
          <InputWrapper label={t('firstName')} id="firstName" error={errors.firstName?.message}>
            <Input
              id="firstName"
              {...register('firstName')}
              className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-12 text-2xl font-display italic placeholder:text-stone-300 focus-visible:ring-0 focus-visible:border-stone-900 transition-all duration-500"
              placeholder="e.g. Eleanor"
            />
          </InputWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <InputWrapper label={t('lastName')} id="lastName">
              <Input
                id="lastName"
                {...register('lastName')}
                className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-10 text-lg font-display placeholder:text-stone-300 focus-visible:ring-0 focus-visible:border-stone-900 transition-all duration-500"
                placeholder="Primary surname"
              />
            </InputWrapper>
            <InputWrapper label={t('lastName2')} id="lastName2">
              <Input
                id="lastName2"
                {...register('lastName2')}
                className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-10 text-lg font-display placeholder:text-stone-300 focus-visible:ring-0 focus-visible:border-stone-900 transition-all duration-500"
                placeholder="Secondary surname"
              />
            </InputWrapper>
          </div>

          <div className="w-full md:w-1/2">
            <InputWrapper label={t('gender')} id="gender">
              <div className="relative">
                <select
                  id="gender"
                  {...register('gender')}
                  className="appearance-none w-full bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-10 text-sm font-body focus:outline-none focus:border-stone-900 transition-all duration-500 cursor-pointer"
                >
                  <option value="unknown">{t('genderUnknown')}</option>
                  <option value="male">{t('genderMale')}</option>
                  <option value="female">{t('genderFemale')}</option>
                  <option value="other">{t('genderOther')}</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            </InputWrapper>
          </div>
        </div>
      </section>

      {/* Life Timeline Section */}
      <section className="relative">
        <div className="absolute -left-8 top-0 bottom-0 w-px bg-stone-200 hidden md:block" />
        <SectionTitle icon={Calendar} title="Chronology of Life" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {/* Birth */}
          <div className="space-y-8 p-6 bg-stone-50/50 rounded-sm border border-stone-100">
            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-2">
              Arrival
            </h4>
            <InputWrapper label={t('birthDate')} id="birthDate">
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
                className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-stone-900 transition-all duration-500 font-body"
              />
            </InputWrapper>
            <InputWrapper label={t('birthPlace')} id="birthPlace">
              <div className="relative">
                <Input
                  id="birthPlace"
                  {...register('birthPlace')}
                  className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-10 pl-7 focus-visible:ring-0 focus-visible:border-stone-900 transition-all duration-500 placeholder:text-stone-300"
                  placeholder="City, Province, Country"
                />
                <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 stroke-[1.5]" />
              </div>
            </InputWrapper>
          </div>

          {/* Death */}
          <div className="space-y-8 p-6 bg-stone-50/50 rounded-sm border border-stone-100">
            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-2">
              Departure
            </h4>
            <InputWrapper label={t('deathDate')} id="deathDate">
              <Input
                id="deathDate"
                type="date"
                {...register('deathDate')}
                className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-stone-900 transition-all duration-500 opacity-60 focus:opacity-100 font-body"
              />
            </InputWrapper>
            <InputWrapper label={t('deathPlace')} id="deathPlace">
              <div className="relative">
                <Input
                  id="deathPlace"
                  {...register('deathPlace')}
                  className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-10 pl-7 focus-visible:ring-0 focus-visible:border-stone-900 transition-all duration-500 opacity-60 focus:opacity-100 placeholder:text-stone-300"
                  placeholder="Final resting place"
                />
                <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 stroke-[1.5]" />
              </div>
            </InputWrapper>
          </div>
        </div>
      </section>

      {/* Media & Narrative Section */}
      <section className="relative">
        <div className="absolute -left-8 top-0 bottom-0 w-px bg-stone-200 hidden md:block" />
        <SectionTitle icon={AlignLeft} title="Narrative & Visuals" />

        <div className="space-y-10">
          <InputWrapper label={t('photoUrl')} id="photoUrl" error={errors.photoUrl?.message}>
            <div className="relative">
              <Input
                id="photoUrl"
                type="url"
                placeholder="Link to an archival portrait..."
                {...register('photoUrl')}
                className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 h-10 pl-7 focus-visible:ring-0 focus-visible:border-stone-900 transition-all duration-500 placeholder:text-stone-300"
              />
              <Camera className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 stroke-[1.5]" />
            </div>
          </InputWrapper>

          <InputWrapper label={t('bio')} id="bio">
            <div className="relative group/bio">
              <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-stone-100 group-focus-within/bio:bg-stone-900 transition-colors duration-500" />
              <Textarea
                id="bio"
                rows={6}
                {...register('bio')}
                className="bg-transparent border-0 rounded-none p-0 text-lg font-body text-stone-700 leading-relaxed focus-visible:ring-0 transition-all resize-none italic placeholder:text-stone-200"
                placeholder="Transcribe the essence of their journey through time..."
              />
            </div>
          </InputWrapper>
        </div>
      </section>

      <div className="pt-12 border-t border-stone-100 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="group relative inline-flex items-center gap-4 px-12 py-4 bg-stone-900 text-stone-50 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-stone-800 transition-all duration-300 disabled:opacity-50 overflow-hidden"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Sparkles className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
