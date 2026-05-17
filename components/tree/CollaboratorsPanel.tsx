'use client'
import { useState, useTransition } from 'react'
import { inviteCollaborator, removeMember } from '@/server/collaboration'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, UserX, Clock, CheckCircle2, Loader2 } from 'lucide-react'

type Member = {
  id: string
  invitedEmail: string
  status: 'pending' | 'accepted' | 'revoked'
  invitedAt: Date
  expiresAt: Date
  acceptedAt: Date | null
  user: { name: string; email: string } | null
}

interface Props {
  treeId: string
  members: Member[]
  slotCount: number
}

const MAX_COLLABORATORS = 3

export function CollaboratorsPanel({ treeId, members, slotCount }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const slotsUsed = slotCount
  const slotsAvailable = MAX_COLLABORATORS - slotsUsed
  const isAtLimit = slotsAvailable <= 0

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await inviteCollaborator(treeId, { email })
      if (result.success) {
        setEmail('')
        setSuccess(true)
      } else {
        setError(result.error)
      }
    })
  }

  function handleRemove(memberId: string) {
    setRemovingId(memberId)
    startTransition(async () => {
      await removeMember(memberId)
      setRemovingId(null)
    })
  }

  return (
    <div className="space-y-8">
      {/* Slot counter */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-sepia/60 font-medium">Slots</p>
        <p className="text-xs text-sepia/70">
          <span className="font-semibold text-ink">{slotsUsed}</span> de {MAX_COLLABORATORS} usados
        </p>
      </div>

      {/* Slot bar */}
      <div className="flex gap-1.5">
        {Array.from({ length: MAX_COLLABORATORS }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < slotsUsed ? 'bg-ink' : 'bg-rule/40'
            }`}
          />
        ))}
      </div>

      {/* Member list */}
      {members.length > 0 ? (
        <ul className="space-y-3">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between py-3 border-b border-rule/30 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-parchment-mid flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-sepia/60" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {m.user?.name ?? m.invitedEmail}
                  </p>
                  {m.user && <p className="text-xs text-sepia/60 truncate">{m.invitedEmail}</p>}
                  {m.status === 'pending' && (
                    <p className="text-[10px] text-sepia/50 mt-0.5">
                      Caduca{' '}
                      {new Date(m.expiresAt).toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                {m.status === 'pending' ? (
                  <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-amber-600/70 border border-amber-200 rounded-full px-2 py-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    Pendiente
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-emerald-600/70 border border-emerald-200 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Activo
                  </span>
                )}
                <button
                  onClick={() => handleRemove(m.id)}
                  disabled={removingId === m.id}
                  className="text-sepia/40 hover:text-red-500 transition-colors duration-200 disabled:opacity-40"
                  title="Eliminar"
                >
                  {removingId === m.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserX className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-sepia/50 italic">Aún no hay colaboradores.</p>
      )}

      {/* Invite form */}
      <form onSubmit={handleInvite} className="space-y-3 pt-2">
        <Label
          htmlFor="invite-email"
          className="text-[10px] uppercase tracking-widest text-sepia/60"
        >
          Invitar por email
        </Label>
        <div className="flex gap-2">
          <Input
            id="invite-email"
            type="email"
            placeholder="colaborador@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAtLimit || isPending}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={isAtLimit || isPending || !email}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invitar'}
          </Button>
        </div>
        {isAtLimit && (
          <p className="text-xs text-sepia/60">
            Límite de {MAX_COLLABORATORS} colaboradores alcanzado.
          </p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-emerald-600">Invitación enviada correctamente.</p>}
      </form>
    </div>
  )
}
