'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deletePerson } from '@/server/persons'
import { Button } from '@/components/ui/button'

export function DeletePersonButton({ personId, treeId }: { personId: string; treeId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePerson(personId)
      if (result.success) {
        toast.success('Person deleted')
        router.push(`/trees/${treeId}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button variant="ghost" size="sm" className="text-stone-400 hover:text-red-500" onClick={handleDelete} disabled={pending}>
      {pending ? 'Deleting…' : 'Delete person'}
    </Button>
  )
}
