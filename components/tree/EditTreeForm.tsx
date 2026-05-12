'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@/i18n/navigation'
import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { treeSchema, type TreeInput } from '@/lib/validations'
import { updateTree } from '@/server/trees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, TreePine } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  treeId: string
  defaultName: string
  defaultDescription: string | null
}

export function EditTreeForm({ treeId, defaultName, defaultDescription }: Props) {
  const t = useTranslations('editTree')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<TreeInput>({
    resolver: zodResolver(treeSchema),
    defaultValues: {
      name: defaultName,
      description: defaultDescription || '',
    },
  })

  function onSubmit(data: TreeInput) {
    startTransition(async () => {
      const result = await updateTree(treeId, data)
      if (result.success) {
        toast.success(t('successToast'))
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sepia/40 hover:text-sepia hover:bg-parchment-mid/30 transition-all duration-300 rounded-sm px-2"
        >
          <Pencil className="w-3.5 h-3.5" />
          {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-parchment border-rule/60 rounded-sm p-8">
        <DialogHeader className="mb-6">
          <div className="w-12 h-12 bg-parchment-mid rounded-full flex items-center justify-center mb-4">
            <TreePine className="w-6 h-6 text-sepia" />
          </div>
          <DialogTitle className="text-3xl font-display text-ink">{t('title')}</DialogTitle>
          <DialogDescription className="font-body italic text-sepia">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-sepia font-semibold">{t('nameLabel')}</label>
            <Input
              {...register('name')}
              placeholder={t('namePlaceholder')}
              className="bg-white/50 border-rule/40 focus:border-gold/50 focus:ring-gold/20 rounded-sm h-12 font-body"
              disabled={pending}
            />
            {errors.name && <p className="text-xs text-red-500 font-body">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-sepia font-semibold">{t('descriptionLabel')}</label>
            <Textarea
              {...register('description')}
              placeholder={t('descriptionPlaceholder')}
              className="bg-white/50 border-rule/40 focus:border-gold/50 focus:ring-gold/20 rounded-sm min-h-[100px] resize-none font-body"
              disabled={pending}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-sepia hover:text-ink hover:bg-parchment-mid/30"
            >
              {tCommon('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={pending}
              className="bg-ink text-parchment hover:bg-sepia transition-colors duration-300 rounded-sm px-8"
            >
              {pending ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
