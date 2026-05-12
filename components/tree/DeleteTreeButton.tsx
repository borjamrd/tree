'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteTree } from '@/server/trees'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteTreeButton({ treeId }: { treeId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Are you sure you want to remove this lineage from the records?')) return

    startTransition(async () => {
      const result = await deleteTree(treeId)
      if (result.success) {
        toast.success('The lineage has been removed')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-sepia/40 hover:text-red-700 hover:bg-red-50 transition-all duration-300 rounded-sm"
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {pending ? 'Removing…' : 'Remove'}
    </Button>
  )
}
