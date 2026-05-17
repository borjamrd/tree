import { redirect } from 'next/navigation'
import { acceptInvitation } from '@/server/collaboration'
import { getSession } from '@/lib/get-session'
import { Link } from '@/i18n/navigation'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) redirect('/dashboard')

  const session = await getSession()
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/accept?token=${token}`)}`)
  }

  const result = await acceptInvitation(token)

  if (result.success) {
    redirect(`/trees/${result.data!.treeId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
        <p className="text-stone-800 font-medium mb-2">Error con la invitación</p>
        <p className="text-stone-500 text-sm">{result.error}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  )
}
