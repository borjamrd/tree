'use client'
import { Link } from '@/i18n/navigation'
import { X, ArrowUpRight, UserPlus, Fingerprint, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export type PersonDetail = {
  id: string
  treeId: string
  firstName: string
  lastName?: string | null
  lastName2?: string | null
  gender?: string | null
  birthDate?: string | null
  birthPlace?: string | null
  deathDate?: string | null
  deathPlace?: string | null
  isAlive?: boolean
  isSelf?: boolean
  photoUrl?: string | null
  bio?: string | null
}

export type KinshipPerson = {
  id: string
  firstName: string
  lastName?: string | null
  lastName2?: string | null
}

export type KinshipData = {
  parents: KinshipPerson[]
  partners: KinshipPerson[]
  children: KinshipPerson[]
}

type Props = {
  person: PersonDetail
  kinship?: KinshipData
  onClose: () => void
  onAddRelative: () => void
  onToggleSelf: (isSelf: boolean) => void
  onDelete: () => void
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '9px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--rule)',
  marginBottom: 4,
}

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--ink)',
  lineHeight: 1.5,
}

function accentColor(gender?: string | null) {
  if (gender === 'male') return '#C4A252'
  if (gender === 'female') return '#9E7B5A'
  return '#D4C9B5'
}

function formatDate(iso?: string | null) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  if (!y) return iso
  const date = new Date(parseInt(y), parseInt(m) - 1, d ? parseInt(d) : 1)
  return date.toLocaleDateString(undefined, {
    day: d ? 'numeric' : undefined,
    month: 'short',
    year: 'numeric',
  })
}

function personName(p: KinshipPerson) {
  return [p.firstName, p.lastName, p.lastName2].filter(Boolean).join(' ')
}

export function PersonDetailSidebar({
  person,
  kinship,
  onClose,
  onAddRelative,
  onToggleSelf,
  onDelete,
}: Props) {
  const t = useTranslations('personSidebar')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const accent = accentColor(person.gender)
  const fullName = [person.firstName, person.lastName, person.lastName2].filter(Boolean).join(' ')
  const birthFormatted = formatDate(person.birthDate)
  const deathFormatted = formatDate(person.deathDate)

  const hasBirth = birthFormatted || person.birthPlace
  const hasDeath = !person.isAlive && (deathFormatted || person.deathPlace)

  const getKinshipLabels = (gender?: string | null) => {
    const suffix = gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'unknown'
    return {
      child: t(`kinship.childOf_${suffix}`),
      parent: t(`kinship.parentOf_${suffix}`),
    }
  }

  const labels = getKinshipLabels(person.gender)
  const hasKinship =
    kinship &&
    (kinship.parents.length > 0 || kinship.partners.length > 0 || kinship.children.length > 0)

  return (
    <div
      className="absolute top-0 right-0 h-full flex flex-col z-10"
      style={{
        width: 288,
        background: 'var(--parchment)',
        borderLeft: '1px solid var(--rule)',
        boxShadow: '-4px 0 24px rgba(28,21,16,0.06)',
      }}
    >
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />

      {/* Header */}
      <div className="pl-5 pr-4 pt-5 pb-4" style={{ borderBottom: '1px solid var(--rule)' }}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {person.photoUrl ? (
            <div
              className="shrink-0 w-14 h-14 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${person.photoUrl})`,
                border: '1.5px solid var(--rule)',
              }}
            />
          ) : (
            <div
              className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'var(--parchment-mid)', border: '1px solid var(--rule)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 300,
                  color: 'var(--sepia)',
                  lineHeight: 1,
                }}
              >
                {person.firstName.charAt(0)}
              </span>
            </div>
          )}

          {/* Name + dates */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p
              className="leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                fontWeight: 400,
                color: 'var(--ink)',
                letterSpacing: '0.01em',
              }}
            >
              {fullName}
            </p>
            {(birthFormatted || deathFormatted) && (
              <p
                className="mt-1"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--sepia)',
                  fontStyle: 'italic',
                }}
              >
                {birthFormatted ?? '?'}
                {!person.isAlive && deathFormatted ? ` – ${deathFormatted}` : ''}
              </p>
            )}
          </div>

          {/* Actions: view full + close */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/trees/${person.treeId}/persons/${person.id}`}
              className="flex items-center justify-center w-7 h-7 rounded-sm transition-colors hover:opacity-60"
              title={t('viewProfile')}
              style={{
                border: '1px solid var(--rule)',
                color: 'var(--sepia)',
              }}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-sm transition-opacity hover:opacity-50"
              style={{
                border: '1px solid var(--rule)',
                color: 'var(--rule)',
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Birth */}
        {hasBirth && (
          <div>
            <span style={labelStyle}>{t('birth')}</span>
            <p style={valueStyle}>
              {[birthFormatted, person.birthPlace].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}

        {/* Death */}
        {hasDeath && (
          <div>
            <span style={labelStyle}>{t('death')}</span>
            <p style={valueStyle}>
              {[deathFormatted, person.deathPlace].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}

        {/* Gender */}
        {person.gender && person.gender !== 'unknown' && (
          <div>
            <span style={labelStyle}>{t('gender')}</span>
            <p style={{ ...valueStyle, textTransform: 'capitalize' }}>{person.gender}</p>
          </div>
        )}

        {/* Bio */}
        {person.bio && (
          <>
            {/* Ornamental divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
              <div
                className="w-1.5 h-1.5 rotate-45"
                style={{ background: 'var(--rule)', borderRadius: 0.5 }}
              />
              <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
            </div>

            <div>
              <span style={labelStyle}>{t('biography')}</span>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--sepia)',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                }}
              >
                {person.bio}
              </p>
            </div>
          </>
        )}

        {/* Relationships */}
        {hasKinship && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
              <div
                className="w-1.5 h-1.5 rotate-45"
                style={{ background: 'var(--rule)', borderRadius: 0.5 }}
              />
              <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
            </div>

            <div className="space-y-4">
              {kinship!.parents.length > 0 && (
                <div>
                  <span style={labelStyle}>{labels.child}</span>
                  <div className="space-y-1">
                    {kinship!.parents.map((p) => (
                      <p key={p.id} style={valueStyle}>
                        {personName(p)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {kinship!.partners.length > 0 && (
                <div>
                  <span style={labelStyle}>{t('kinship.partnerOf')}</span>
                  <div className="space-y-1">
                    {kinship!.partners.map((p) => (
                      <p key={p.id} style={valueStyle}>
                        {personName(p)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {kinship!.children.length > 0 && (
                <div>
                  <span style={labelStyle}>{labels.parent}</span>
                  <div className="space-y-1">
                    {kinship!.children.map((p) => (
                      <p key={p.id} style={valueStyle}>
                        {personName(p)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!hasBirth && !hasDeath && !person.bio && !hasKinship && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--rule)',
              fontStyle: 'italic',
              textAlign: 'center',
              paddingTop: 12,
            }}
          >
            {t('noDetails')}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 space-y-2" style={{ borderTop: '1px solid var(--rule)' }}>
        <button
          onClick={() => onToggleSelf(!person.isSelf)}
          className="w-full flex items-center justify-center gap-2 py-2.5 transition-colors duration-150"
          style={{
            border: `1px solid ${person.isSelf ? '#6B8F71' : 'var(--rule)'}`,
            background: person.isSelf ? 'rgba(107,143,113,0.08)' : 'transparent',
            color: person.isSelf ? '#6B8F71' : 'var(--sepia)',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            if (!person.isSelf) {
              e.currentTarget.style.borderColor = 'var(--ink)'
              e.currentTarget.style.color = 'var(--ink)'
            }
          }}
          onMouseLeave={(e) => {
            if (!person.isSelf) {
              e.currentTarget.style.borderColor = 'var(--rule)'
              e.currentTarget.style.color = 'var(--sepia)'
            }
          }}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          {person.isSelf ? t('isSelf') : t('markAsSelf')}
        </button>
        <button
          onClick={onAddRelative}
          className="w-full flex items-center justify-center gap-2 py-2.5 transition-colors duration-150"
          style={{
            border: '1px solid var(--rule)',
            background: 'transparent',
            color: 'var(--sepia)',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--ink)'
            e.currentTarget.style.color = 'var(--ink)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--rule)'
            e.currentTarget.style.color = 'var(--sepia)'
          }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          {t('addRelative')}
        </button>

        {confirmingDelete ? (
          <div
            className="flex items-center gap-2"
            style={{
              border: '1px solid #C0392B',
              padding: '8px 12px',
              background: 'rgba(192,57,43,0.05)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: '#C0392B',
                flex: 1,
                lineHeight: 1.4,
              }}
            >
              {t('deleteConfirm')}
            </span>
            <button
              onClick={() => setConfirmingDelete(false)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--sepia)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              {t('deleteCancel')}
            </button>
            <button
              onClick={onDelete}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#C0392B',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                fontWeight: 600,
              }}
            >
              {t('deleteConfirmAction')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 transition-colors duration-150"
            style={{
              border: '1px solid var(--rule)',
              background: 'transparent',
              color: 'var(--rule)',
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#C0392B'
              e.currentTarget.style.color = '#C0392B'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--rule)'
              e.currentTarget.style.color = 'var(--rule)'
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('deletePerson')}
          </button>
        )}
      </div>
    </div>
  )
}
