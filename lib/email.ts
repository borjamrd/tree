import { Resend } from 'resend'
import { InvitationEmail } from '@/emails/invitation'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendInvitationParams {
  to: string
  inviterName: string
  treeName: string
  token: string
}

export async function sendInvitationEmail({
  to,
  inviterName,
  treeName,
  token,
}: SendInvitationParams) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`

  await resend.emails.send({
    from: 'Treel <noreply@treel.cloud>',
    to,
    subject: `${inviterName} te invitó a colaborar en "${treeName}"`,
    react: InvitationEmail({ inviterName, treeName, acceptUrl }),
  })
}
