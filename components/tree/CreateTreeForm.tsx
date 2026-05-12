'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@/i18n/navigation'
import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { treeSchema, type TreeInput } from '@/lib/validations'
import { createTree } from '@/server/trees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, TreePine } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreateTreeForm() {
  const t = useTranslations('createTree')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TreeInput>({
    resolver: zodResolver(treeSchema),
  })

  function onSubmit(data: TreeInput) {
    startTransition(async () => {
      const result = await createTree(data)
      if (result.success) {
        toast.success(t('successToast'))
        reset()
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
        <Button className="bg-ink text-parchment hover:bg-sepia transition-colors duration-300 rounded-sm px-6 h-12 gap-2 shadow-lg shadow-ink/10">
          <Plus className="w-4 h-4" />
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
              className="bg-white/50 border-rule/40 focus:border-gold/50 focus:ring-gold/20 rounded-sm h-12"
              disabled={pending}
            />
            {errors.name && <p className="text-xs text-red-500 font-body">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-sepia font-semibold">{t('descriptionLabel')}</label>
            <Textarea
              {...register('description')}
              placeholder={t('descriptionPlaceholder')}
              className="bg-white/50 border-rule/40 focus:border-gold/50 focus:ring-gold/20 rounded-sm min-h-[100px] resize-none"
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
