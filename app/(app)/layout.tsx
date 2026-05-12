import { devSession } from '@/lib/dev-session'
import Link from 'next/link'
import { TreePine, LayoutDashboard } from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = devSession()

  return (
    <div className="flex h-screen bg-stone-50">
      <aside className="w-56 flex flex-col border-r border-stone-100 bg-white px-4 py-6">
        <div className="flex items-center gap-2 mb-8">
          <TreePine className="w-5 h-5 text-stone-700" />
          <span className="font-semibold text-stone-800 text-lg">Tre</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </nav>

        <div className="mt-auto border-t border-stone-100 pt-4">
          <p className="text-xs text-stone-500 truncate px-3">
            {session.user.name}
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
