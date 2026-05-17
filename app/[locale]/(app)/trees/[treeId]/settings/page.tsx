import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { getTree } from '@/server/trees'
import { getTreeMembers } from '@/server/collaboration'
import { CollaboratorsPanel } from '@/components/tree/CollaboratorsPanel'
import { ArrowLeft, Users } from 'lucide-react'

interface Props {
  params: Promise<{ treeId: string }>
}

export default async function TreeSettingsPage({ params }: Props) {
  const { treeId } = await params

  const tree = await getTree(treeId)
  if (!tree) notFound()

  let members: Awaited<ReturnType<typeof getTreeMembers>> = []
  let isAdmin = true
  try {
    members = await getTreeMembers(treeId)
  } catch {
    // User is a collaborator — settings page is admin-only
    isAdmin = false
  }

  return (
    <div className="min-h-full bg-parchment/30 px-6 py-10 max-w-2xl mx-auto">
      <div className="mb-10">
        <Link
          href={`/trees/${treeId}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-sepia/60 hover:text-sepia transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          Volver al árbol
        </Link>
        <h1 className="text-4xl font-display text-ink italic">{tree.name}</h1>
        <p className="text-[10px] uppercase tracking-widest text-sepia/50 mt-1">Configuración</p>
      </div>

      {!isAdmin ? (
        <div className="bg-white border border-rule/60 rounded-sm p-8 text-center">
          <p className="text-sm text-sepia/60">
            Solo el propietario del árbol puede gestionar los colaboradores.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-rule/60 rounded-sm shadow-[0_4px_20px_-10px_rgba(28,21,16,0.08)] p-8">
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-rule/30">
            <Users className="w-4 h-4 text-sepia/60" />
            <h2 className="text-sm font-medium text-ink uppercase tracking-widest">
              Colaboradores
            </h2>
          </div>
          <CollaboratorsPanel treeId={treeId} members={members} slotCount={members.length} />
        </div>
      )}
    </div>
  )
}
