import { signIn } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TreePine } from 'lucide-react'

export default function LoginPage() {
  async function action(formData: FormData) {
    'use server'
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <div className="flex items-center gap-2 mb-8">
          <TreePine className="w-5 h-5 text-stone-600" />
          <span className="font-semibold text-stone-800 text-lg">Tre</span>
        </div>

        <h1 className="text-xl font-semibold text-stone-800 mb-1">Sign in</h1>
        <p className="text-sm text-stone-500 mb-6">to your family tree</p>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">Sign in</Button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          No account?{' '}
          <Link href="/register" className="text-stone-800 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
