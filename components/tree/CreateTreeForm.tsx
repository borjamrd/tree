'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { treeSchema, type TreeInput } from '@/lib/validations'
import { createTree } from '@/server/trees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

export function CreateTreeForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TreeInput>({
    resolver: zodResolver(treeSchema),
  })

  function onSubmit(data: TreeInput) {
    startTransition(async () => {
      const result = await createTree(data)
      if (result.success) {
        toast.success('Tree created')
        reset()
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-start">
      <div>
        <Input
          {...register('name')}
          placeholder="New tree name…"
          className="w-48"
          disabled={pending}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="w-4 h-4" />
        {pending ? 'Creating…' : 'Create'}
      </Button>
    </form>
  )
}
