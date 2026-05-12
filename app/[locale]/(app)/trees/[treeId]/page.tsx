import { getTreePersons } from '@/server/persons'
import { getTreeRelationships } from '@/server/relationships'
import { getTree } from '@/server/trees'
import { TreeCanvas } from '@/components/tree/TreeCanvas'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Plus } from 'lucide-react'
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
    <div className="h-screen w-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-white shrink-0">
        <h1 className="font-medium text-stone-800">{tree.name}</h1>
        <Link
          href={`/trees/${treeId}/persons/new`}
          className="flex items-center gap-1 bg-stone-800 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addPerson')}
        </Link>
      </header>
      <div className="flex-1">
        <TreeCanvas treeId={treeId} persons={persons} unions={unions} parentage={parentage} />
      </div>
    </div>
  )
}
