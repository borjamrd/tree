'use client'

import { authClient } from '@/lib/auth-client'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TreePine, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: '/dashboard',
    })

    if (error) {
      toast.error(error.message || 'Failed to create account')
      setLoading(false)
    } else {
      toast.success('Account created successfully')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <div className="flex items-center gap-2 mb-8">
          <TreePine className="w-5 h-5 text-stone-600" />
          <span className="font-semibold text-stone-800 text-lg">Tre</span>
        </div>

        <h1 className="text-xl font-semibold text-stone-800 mb-1">{t('title')}</h1>
        <p className="text-sm text-stone-500 mb-6">{t('subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" name="name" type="text" required placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" name="password" type="password" minLength={8} required placeholder="Min. 8 characters" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('submit')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-stone-800 font-medium hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
