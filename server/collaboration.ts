'use server'
import { requireUser } from '@/lib/get-session'
import { db } from '@/lib/db'
import { treeMembers } from '@/lib/db/schema'
import { and, eq, lt, or } from 'drizzle-orm'
import { requireTreeAdmin, getActiveSlotCount } from '@/lib/tree-access'
import { sendInvitationEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MAX_COLLABORATORS = 3
const INVITE_TTL_DAYS = 7

type Result<T = void> = { success: true; data?: T } | { success: false; error: string }

const inviteSchema = z.object({
  email: z.string().email(),
})

export async function inviteCollaborator(
  treeId: string,
  input: { email: string }
): Promise<Result> {
  try {
    const user = await requireUser()
    const tree = await requireTreeAdmin(treeId, user.id)
    const { email } = inviteSchema.parse(input)

    if (email === user.email) {
      return { success: false, error: 'No puedes invitarte a ti mismo' }
    }

    const activeSlots = await getActiveSlotCount(treeId)
    if (activeSlots >= MAX_COLLABORATORS) {
      return {
        success: false,
        error: `Este árbol ya tiene el máximo de ${MAX_COLLABORATORS} colaboradores`,
      }
    }

    // Check any existing row for this email+tree (all statuses, due to unique constraint)
    const existing = await db.query.treeMembers.findFirst({
      where: and(eq(treeMembers.treeId, treeId), eq(treeMembers.invitedEmail, email)),
    })

    if (existing && (existing.status === 'pending' || existing.status === 'accepted')) {
      return { success: false, error: 'Este email ya tiene acceso o una invitación pendiente' }
    }

    const inviteToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS)

    if (existing) {
      // Revoked row exists — reuse it to satisfy the unique constraint
      await db
        .update(treeMembers)
        .set({
          inviteToken,
          status: 'pending',
          invitedBy: user.id,
          invitedAt: new Date(),
          acceptedAt: null,
          userId: null,
          expiresAt,
        })
        .where(eq(treeMembers.id, existing.id))
    } else {
      await db.insert(treeMembers).values({
        treeId,
        invitedEmail: email,
        inviteToken,
        status: 'pending',
        invitedBy: user.id,
        expiresAt,
      })
    }

    await sendInvitationEmail({
      to: email,
      inviterName: user.name,
      treeName: tree.name,
      token: inviteToken,
    })

    revalidatePath(`/trees/${treeId}/settings`)
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Error al enviar la invitación',
    }
  }
}

export async function acceptInvitation(token: string): Promise<Result<{ treeId: string }>> {
  try {
    const user = await requireUser()

    const invitation = await db.query.treeMembers.findFirst({
      where: and(eq(treeMembers.inviteToken, token), eq(treeMembers.status, 'pending')),
    })

    if (!invitation) {
      return { success: false, error: 'Invitación no encontrada o ya utilizada' }
    }

    if (new Date() > invitation.expiresAt) {
      return { success: false, error: 'Esta invitación ha caducado' }
    }

    if (user.email !== invitation.invitedEmail) {
      return {
        success: false,
        error: `Esta invitación fue enviada a ${invitation.invitedEmail}. Inicia sesión con esa cuenta.`,
      }
    }

    await db
      .update(treeMembers)
      .set({
        status: 'accepted',
        userId: user.id,
        acceptedAt: new Date(),
      })
      .where(eq(treeMembers.id, invitation.id))

    revalidatePath('/dashboard')
    return { success: true, data: { treeId: invitation.treeId } }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Error al aceptar la invitación',
    }
  }
}

export async function removeMember(memberId: string): Promise<Result> {
  try {
    const user = await requireUser()

    const member = await db.query.treeMembers.findFirst({
      where: eq(treeMembers.id, memberId),
    })
    if (!member) return { success: false, error: 'Miembro no encontrado' }

    await requireTreeAdmin(member.treeId, user.id)

    await db.update(treeMembers).set({ status: 'revoked' }).where(eq(treeMembers.id, memberId))

    revalidatePath(`/trees/${member.treeId}/settings`)
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Error al eliminar el miembro',
    }
  }
}

export async function getTreeMembers(treeId: string) {
  const user = await requireUser()
  await requireTreeAdmin(treeId, user.id)

  // Lazily expire stale pending invitations
  await db
    .update(treeMembers)
    .set({ status: 'revoked' })
    .where(
      and(
        eq(treeMembers.treeId, treeId),
        eq(treeMembers.status, 'pending'),
        lt(treeMembers.expiresAt, new Date())
      )
    )

  return db.query.treeMembers.findMany({
    where: and(
      eq(treeMembers.treeId, treeId),
      or(eq(treeMembers.status, 'pending'), eq(treeMembers.status, 'accepted'))
    ),
    with: { user: true },
    orderBy: (m, { asc }) => [asc(m.invitedAt)],
  })
}
