import { getTreePersons } from '@/server/persons'
import { getTreeRelationships } from '@/server/relationships'
import { getTree } from '@/server/trees'
import { TreeCanvas } from '@/components/tree/TreeCanvas'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { UserPlus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function TreePage({ params }: { params: Promise<{ treeId: string }> }) {
  const { treeId } = await params
  const t = await getTranslations('treePage')

  const [tree, persons, { unions, parentage }] = await Promise.all([
    getTree(treeId),
    getTreePersons(treeId),
    getTreeRelationships(treeId),
  ])

  if (!tree) notFound()

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
        
        <Link
          href={`/trees/${treeId}/persons/new`}
          className="group flex items-center gap-2 px-5 py-2.5 transition-all duration-150 rounded-sm"
          style={{
            border: '1px solid var(--rule)',
            background: 'transparent',
            color: 'var(--sepia)',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>{t('addPerson')}</span>
        </Link>
      </header>

      <div className="flex-1 relative">
        {/* Subtle grid background for the canvas area */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />
        <TreeCanvas treeId={treeId} persons={persons} unions={unions} parentage={parentage} />
      </div>
    </div>
  )
}
