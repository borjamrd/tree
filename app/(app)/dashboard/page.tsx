import { getUserTrees, createTree, deleteTree } from '@/server/trees'
import Link from 'next/link'
import { Plus, TreePine, Trash2 } from 'lucide-react'

export default async function DashboardPage() {
  const trees = await getUserTrees()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Your Trees</h1>
        <form action={async (fd) => {
          'use server'
          const name = fd.get('name') as string
          if (name?.trim()) await createTree({ name: name.trim() })
        }}>
          <div className="flex gap-2">
            <input
              name="name"
              placeholder="New tree name..."
              required
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <button
              type="submit"
              className="flex items-center gap-1 bg-stone-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </form>
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
            <div
              key={tree.id}
              className="bg-white rounded-xl border border-stone-100 shadow-sm p-5 flex flex-col gap-3"
            >
              <Link href={`/trees/${tree.id}`} className="flex-1">
                <h2 className="font-medium text-stone-800 hover:underline">{tree.name}</h2>
                {tree.description && (
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">{tree.description}</p>
                )}
                <p className="text-xs text-stone-400 mt-2">
                  {new Date(tree.createdAt).toLocaleDateString()}
                </p>
              </Link>
              <form action={async () => {
                'use server'
                await deleteTree(tree.id)
              }}>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
