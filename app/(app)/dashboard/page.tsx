import { getUserTrees } from '@/server/trees'
import Link from 'next/link'
import { TreePine, Calendar, ArrowRight, Plus } from 'lucide-react'
import { CreateTreeForm } from '@/components/tree/CreateTreeForm'
import { DeleteTreeButton } from '@/components/tree/DeleteTreeButton'
import { EditTreeForm } from '@/components/tree/EditTreeForm'

export default async function DashboardPage() {
  const trees = await getUserTrees()

  return (
    <div className="min-h-full bg-parchment/50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237D6545' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
      />

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-fade-up">
          <div>
            <h1 className="text-5xl md:text-6xl font-display text-ink tracking-tight">
              Your Lineage
            </h1>
            <p className="font-body italic text-sepia text-lg mt-3 max-w-md">
              {trees.length === 0 
                ? "Begin your journey into the past by documenting your family's unique story."
                : `Overseeing ${trees.length} ${trees.length === 1 ? 'legacy' : 'legacies'} across generations.`
              }
            </p>
          </div>
          <CreateTreeForm />
        </header>

        {trees.length === 0 ? (
          <div className="animate-fade-up delay-150 border border-dashed border-rule rounded-3xl py-32 flex flex-col items-center justify-center text-center bg-parchment-mid/20">
            <div className="w-20 h-20 rounded-full bg-parchment-mid flex items-center justify-center mb-6">
              <TreePine className="w-10 h-10 text-sepia opacity-60" />
            </div>
            <h2 className="text-2xl font-display text-ink mb-2">No Records Found</h2>
            <p className="font-body text-sepia max-w-xs mx-auto mb-8">
              Every great history starts with a single name. Create your first family tree to begin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trees.map((tree, index) => (
              <div 
                key={tree.id} 
                className="animate-fade-up group"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="relative bg-white border border-rule/60 p-8 rounded-sm shadow-[0_4px_20px_-10px_rgba(28,21,16,0.1)] transition-all duration-500 hover:shadow-[0_15px_40px_-15px_rgba(28,21,16,0.15)] hover:-translate-y-1 overflow-hidden">
                  {/* Card Actions */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <EditTreeForm 
                      treeId={tree.id} 
                      defaultName={tree.name} 
                      defaultDescription={tree.description} 
                    />
                    <DeleteTreeButton treeId={tree.id} />
                  </div>

                  {/* Card Ornament */}
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-10 translate-x-6 -translate-y-6">
                    <TreePine className="w-full h-full text-gold" />
                  </div>
                  
                  <Link href={`/trees/${tree.id}`} className="block">
                    <div className="mb-6">
                      <h2 className="text-2xl font-display text-ink group-hover:text-sepia transition-colors duration-300 pr-12">
                        {tree.name}
                      </h2>
                      <div className="h-px w-8 bg-gold/40 mt-2 group-hover:w-16 transition-all duration-500" />
                    </div>
                    
                    <p className="font-body text-sepia/80 text-sm line-clamp-2 mb-8 min-h-[2.5rem]">
                      {tree.description || "A documented history of the family lineage and descendants."}
                    </p>

                    <div className="flex items-center justify-between border-t border-rule/30 pt-4">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-sepia/60">
                        <Calendar className="w-3 h-3" />
                        {new Date(tree.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-2 transition-all duration-300">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Decorative Gradient Flare */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sepia/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  )
}
