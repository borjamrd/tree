import { getTreePersons } from '@/server/persons'
import { getTreeRelationships } from '@/server/relationships'
import { getTree } from '@/server/trees'
import { requireUser } from '@/lib/get-session'
import { TreeCanvas } from '@/components/tree/TreeCanvas'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { Settings } from 'lucide-react'

export default async function TreePage({ params }: { params: Promise<{ treeId: string }> }) {
  const { treeId } = await params

  const [tree, persons, { unions, parentage }, user] = await Promise.all([
    getTree(treeId),
    getTreePersons(treeId),
    getTreeRelationships(treeId),
    requireUser(),
  ])

  if (!tree) notFound()

  const isAdmin = tree.userId === user.id

  return (
    <div className="h-screen w-full flex flex-col bg-[#fdfcfb]">
      <header
        className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shrink-0 z-20"
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <div className="flex flex-col">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 leading-none mb-1.5">
            Family Lineage
          </p>
          <h1 className="text-2xl font-display font-medium text-stone-900 leading-none italic">
            {tree.name}
          </h1>
        </div>
        {isAdmin && (
          <Link
            href={`/trees/${treeId}/settings`}
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-sepia/50 hover:text-sepia transition-colors duration-200"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
        )}
      </header>

      <div className="flex-1 relative">
        {/* Subtle grid background for the canvas area */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />
        <TreeCanvas treeId={treeId} persons={persons} unions={unions} parentage={parentage} />
      </div>
    </div>
  )
}
