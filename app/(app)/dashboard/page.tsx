import { getUserTrees } from '@/server/trees'
import Link from 'next/link'
import { TreePine, Calendar } from 'lucide-react'
import { CreateTreeForm } from '@/components/tree/CreateTreeForm'
import { DeleteTreeButton } from '@/components/tree/DeleteTreeButton'

export default async function DashboardPage() {
  const trees = await getUserTrees()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Your Trees</h1>
          <p className="text-sm text-stone-500 mt-1">
            {trees.length} {trees.length === 1 ? 'tree' : 'trees'}
          </p>
        </div>
        <CreateTreeForm />
      </div>

      {trees.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <TreePine className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">No trees yet</p>
          <p className="text-sm">Create your first family tree above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trees.map((tree) => (
            <div key={tree.id} className="group bg-white rounded-xl border border-stone-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <Link href={`/trees/${tree.id}`} className="flex-1">
                <h2 className="font-medium text-stone-800 group-hover:text-stone-600 transition-colors">
                  {tree.name}
                </h2>
                {tree.description && (
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">{tree.description}</p>
                )}
                <div className="flex items-center gap-1 mt-3 text-xs text-stone-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(tree.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </div>
              </Link>
              <DeleteTreeButton treeId={tree.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
