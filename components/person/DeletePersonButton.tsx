'use client'
import { useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { deletePerson } from '@/server/persons'
import { Button } from '@/components/ui/button'

export function DeletePersonButton({ personId, treeId }: { personId: string; treeId: string }) {
  const t = useTranslations('deletePersonButton')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(t('confirm'))) return

    startTransition(async () => {
      const result = await deletePerson(personId)
      if (result.success) {
        toast.success(t('successToast'))
        router.push(`/trees/${treeId}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button variant="ghost" size="sm" className="text-stone-400 hover:text-red-500" onClick={handleDelete} disabled={pending}>
      {pending ? tCommon('removing') : t('trigger')}
    </Button>
  )
}
