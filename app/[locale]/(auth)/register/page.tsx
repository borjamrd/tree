import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TreePine } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

export default function RegisterPage() {
  async function action(formData: FormData) {
    'use server'
    const parsed = registerSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })
    if (!parsed.success) return

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    await db.insert(users).values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    })
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <div className="flex items-center gap-2 mb-8">
          <TreePine className="w-5 h-5 text-stone-600" />
          <span className="font-semibold text-stone-800 text-lg">Tre</span>
        </div>

        <h1 className="text-xl font-semibold text-stone-800 mb-1">Create account</h1>
        <p className="text-sm text-stone-500 mb-6">start your family tree</p>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" type="text" required placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required placeholder="Min. 8 characters" />
          </div>
          <Button type="submit" className="w-full">Create account</Button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-stone-800 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
