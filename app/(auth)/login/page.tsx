import { signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
        <h1 className="text-2xl font-semibold text-stone-800 mb-1">Sign in</h1>
        <p className="text-sm text-stone-500 mb-6">to your family tree</p>

        <form action={action} className="space-y-4">
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
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Sign in
          </button>
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
