import type { Metadata } from 'next'
import { Cormorant_Garamond, Crimson_Pro } from 'next/font/google'
import { Toaster } from 'sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import '../globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const crimson = Crimson_Pro({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['200', '300', '400', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'TRE — Your Family History',
  description: 'Preserve, visualize, and share your family tree across generations.',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validar locale
  if (!routing.locales.includes(locale as never)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${cormorant.variable} ${crimson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
