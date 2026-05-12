import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

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
        <h1 className="text-2xl font-semibold text-stone-800 mb-1">Create account</h1>
        <p className="text-sm text-stone-500 mb-6">start your family tree</p>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Create account
          </button>
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
