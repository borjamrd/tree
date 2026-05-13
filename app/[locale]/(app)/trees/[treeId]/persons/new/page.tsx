import { createPerson } from '@/server/persons'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { PersonForm } from '@/components/person/PersonForm'
import type { PersonInput } from '@/lib/validations'
import { getTranslations } from 'next-intl/server'

export default async function NewPersonPage({ params }: { params: Promise<{ treeId: string }> }) {
  const { treeId } = await params
  const t = await getTranslations('newPersonPage')

  async function action(data: PersonInput) {
    'use server'
    return createPerson(treeId, data)
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb] selection:bg-stone-200/50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#f5f2ee] rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-[#efebdf] rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="relative z-10 p-8 max-w-2xl mx-auto">
        <header className="mb-12">
          <Link
            href={`/trees/${treeId}`}
            className="group inline-flex items-center gap-3 text-stone-400 hover:text-stone-700 transition-all duration-300 mb-8"
          >
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center transition-colors"
              style={{ border: '1px solid var(--rule)', color: 'var(--sepia)' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span
              className="font-medium tracking-[0.14em] uppercase text-[10px]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {t('backToTree')}
            </span>
          </Link>

          <div className="flex items-end gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-white shadow-xl shadow-stone-200">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 leading-none mb-1">
                {t('newMember')}
              </p>
              <h1 className="text-4xl font-display font-medium text-stone-900 leading-none italic">
                {t('addPerson')}
              </h1>
            </div>
          </div>
          <div className="h-px w-24 bg-stone-200 mt-6" />
        </header>

        <div className="bg-white/80 backdrop-blur-sm rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-white/50 p-10 relative overflow-hidden group">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

          <PersonForm treeId={treeId} action={action} submitLabel={t('addPerson')} />
        </div>

        <footer className="mt-12 text-center">
          <p className="text-[11px] text-stone-400 font-medium tracking-wider uppercase italic">
            &ldquo;Every story matters.&rdquo;
          </p>
        </footer>
      </div>
    </div>
  )
}
