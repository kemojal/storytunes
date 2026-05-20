import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const from = process.env.EMAIL_FROM ?? 'StoryTunes <onboarding@resend.dev>'

type SendEmailInput = {
  to: string
  subject: string
  text: string
  html?: string
}

/**
 * Thin transactional-email wrapper around Resend.
 *
 * In dev, if RESEND_API_KEY is unset we log to the console instead of throwing,
 * so sign-in/OTP flows are testable without credentials.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  if (!resend) {
    console.info(`[email:dev] to=${to} subject="${subject}"\n${text}`)
    return
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  })

  if (error) {
    throw new Error(`Resend failed: ${error.message}`)
  }
}
