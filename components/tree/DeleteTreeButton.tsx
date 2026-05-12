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
    startTransition(async () => {
      const result = await deleteTree(treeId)
      if (result.success) {
        toast.success('Tree deleted')
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
      className="text-stone-400 hover:text-red-500 -ml-2"
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {pending ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
