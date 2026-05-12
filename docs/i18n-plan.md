# Plan de implementación: Internacionalización con `next-intl`

> **Estado**: pendiente de implementar  
> **Librería**: [`next-intl`](https://next-intl-docs.vercel.app/) v4+  
> **Idiomas iniciales**: `en` (por defecto), `es`  
> **Estrategia de URL**: prefijo de locale en la ruta → `/en/dashboard`, `/es/dashboard`

---

## Resumen del impacto

Este proyecto usa Next.js 16 con App Router. La integración de `next-intl` requiere:

1. Añadir un segmento dinámico `[locale]` que envuelva todas las rutas actuales.
2. Crear los archivos JSON de mensajes.
3. Configurar el middleware para detección/redirección de locale.
4. Adaptar los layouts y los componentes para consumir traducciones.

El cambio más disruptivo es el **movimiento de carpetas** bajo `[locale]`. El resto son cambios aditivos.

---

## Fase 1 — Instalación y configuración base

### 1.1 Instalar la dependencia

```bash
pnpm add next-intl
```

### 1.2 Crear `i18n/routing.ts`

```ts
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
})
```

### 1.3 Crear `i18n/request.ts`

Este archivo configura cómo `next-intl` carga los mensajes en Server Components.

```ts
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

### 1.4 Actualizar `next.config.ts`

```ts
// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default withNextIntl(nextConfig)
```

---

## Fase 2 — Archivos de mensajes JSON

Crear el directorio `messages/` en la raíz del proyecto.

### `messages/en.json`

```json
{
  "common": {
    "cancel": "Cancel",
    "save": "Save",
    "saving": "Saving…",
    "back": "Back",
    "edit": "Edit",
    "remove": "Remove",
    "removing": "Removing…"
  },
  "nav": {
    "dashboard": "Dashboard",
    "appName": "Tre"
  },
  "dashboard": {
    "title": "Your Lineage",
    "subtitleEmpty": "Begin your journey into the past by documenting your family's unique story.",
    "subtitleCount_one": "Overseeing {{count}} legacy across generations.",
    "subtitleCount_other": "Overseeing {{count}} legacies across generations.",
    "emptyTitle": "No Records Found",
    "emptyDescription": "Every great history starts with a single name. Create your first family tree to begin.",
    "explore": "Explore",
    "defaultDescription": "A documented history of the family lineage and descendants."
  },
  "createTree": {
    "trigger": "Establish New Lineage",
    "title": "New Family Tree",
    "description": "Enter the details of the lineage you wish to document.",
    "nameLabel": "Tree Name",
    "namePlaceholder": "e.g. The Harrison Dynasty",
    "descriptionLabel": "Description (Optional)",
    "descriptionPlaceholder": "A brief history of this branch...",
    "submit": "Create Tree",
    "submitting": "Establishing…",
    "successToast": "Your new lineage has been established"
  },
  "editTree": {
    "trigger": "Edit",
    "title": "Amend Records",
    "description": "Update the title and historical context of this lineage.",
    "nameLabel": "Tree Name",
    "namePlaceholder": "e.g. The Harrison Dynasty",
    "descriptionLabel": "Description (Optional)",
    "descriptionPlaceholder": "A brief history of this branch...",
    "submit": "Update Records",
    "submitting": "Amending…",
    "successToast": "Lineage records updated"
  },
  "deleteTree": {
    "trigger": "Remove",
    "confirm": "Are you sure you want to remove this lineage from the records?",
    "successToast": "The lineage has been removed"
  },
  "treePage": {
    "addPerson": "Add person"
  },
  "personForm": {
    "firstName": "First name *",
    "lastName": "Last name",
    "lastName2": "Second last name",
    "gender": "Gender",
    "genderUnknown": "Unknown",
    "genderMale": "Male",
    "genderFemale": "Female",
    "genderOther": "Other",
    "birthDate": "Birth date",
    "birthPlace": "Birth place",
    "deathDate": "Death date",
    "deathPlace": "Death place",
    "photoUrl": "Photo URL",
    "photoUrlPlaceholder": "https://…",
    "bio": "Bio",
    "successAdd": "Person added",
    "successUpdate": "Person updated"
  },
  "deletePersonButton": {
    "trigger": "Delete person",
    "confirm": "Are you sure you want to delete this person?"
  },
  "personDetailPage": {
    "backToTree": "Back to tree",
    "editPerson": "Edit"
  },
  "editPersonPage": {
    "back": "Back",
    "title": "Edit person",
    "submitLabel": "Save changes"
  },
  "newPersonPage": {
    "back": "Back to tree",
    "title": "Add person"
  },
  "personCard": {
    "birth": "Birth",
    "death": "Death",
    "gender": "Gender",
    "bio": "Biography",
    "alive": "Alive",
    "deceased": "Deceased"
  },
  "personSidebar": {
    "noDetails": "No details recorded yet.",
    "birth": "Birth",
    "death": "Death",
    "gender": "Gender",
    "biography": "Biography",
    "isSelf": "That's me",
    "markAsSelf": "Mark as me",
    "addRelative": "Add relative",
    "viewProfile": "View full profile",
    "kinship": {
      "childOf_male": "Son of",
      "childOf_female": "Daughter of",
      "childOf_unknown": "Child of",
      "parentOf_male": "Father of",
      "parentOf_female": "Mother of",
      "parentOf_unknown": "Parent of",
      "partnerOf": "Partner of"
    }
  },
  "relativeSidebar": {
    "title": "Add Relative",
    "of": "of {{name}}",
    "relationship": "Relationship",
    "partner": "Partner",
    "child": "Child",
    "parent": "Parent",
    "firstName": "First name *",
    "firstNamePlaceholder": "First name",
    "lastName": "Last name",
    "lastName2": "Second last name",
    "gender": "Gender",
    "birthDate": "Birth date",
    "birthPlace": "Birth place",
    "submit": "Add {{relationship}}",
    "submitting": "Adding…",
    "successToast": "{{relationship}} added"
  }
}
```

### `messages/es.json`

```json
{
  "common": {
    "cancel": "Cancelar",
    "save": "Guardar",
    "saving": "Guardando…",
    "back": "Atrás",
    "edit": "Editar",
    "remove": "Eliminar",
    "removing": "Eliminando…"
  },
  "nav": {
    "dashboard": "Panel",
    "appName": "Tre"
  },
  "dashboard": {
    "title": "Tu linaje",
    "subtitleEmpty": "Empieza tu viaje al pasado documentando la historia única de tu familia.",
    "subtitleCount_one": "Gestionando {{count}} legado a través de las generaciones.",
    "subtitleCount_other": "Gestionando {{count}} legados a través de las generaciones.",
    "emptyTitle": "Sin registros",
    "emptyDescription": "Toda gran historia empieza con un nombre. Crea tu primer árbol genealógico para comenzar.",
    "explore": "Explorar",
    "defaultDescription": "Una historia documentada del linaje familiar y sus descendientes."
  },
  "createTree": {
    "trigger": "Establecer nuevo linaje",
    "title": "Nuevo árbol genealógico",
    "description": "Introduce los datos del linaje que deseas documentar.",
    "nameLabel": "Nombre del árbol",
    "namePlaceholder": "ej. La Dinastía García",
    "descriptionLabel": "Descripción (Opcional)",
    "descriptionPlaceholder": "Una breve historia de esta rama...",
    "submit": "Crear árbol",
    "submitting": "Estableciendo…",
    "successToast": "Tu nuevo linaje ha sido establecido"
  },
  "editTree": {
    "trigger": "Editar",
    "title": "Modificar registros",
    "description": "Actualiza el título y el contexto histórico de este linaje.",
    "nameLabel": "Nombre del árbol",
    "namePlaceholder": "ej. La Dinastía García",
    "descriptionLabel": "Descripción (Opcional)",
    "descriptionPlaceholder": "Una breve historia de esta rama...",
    "submit": "Actualizar registros",
    "submitting": "Modificando…",
    "successToast": "Registros actualizados"
  },
  "deleteTree": {
    "trigger": "Eliminar",
    "confirm": "¿Seguro que quieres eliminar este linaje de los registros?",
    "successToast": "El linaje ha sido eliminado"
  },
  "treePage": {
    "addPerson": "Añadir persona"
  },
  "personForm": {
    "firstName": "Nombre *",
    "lastName": "Primer apellido",
    "lastName2": "Segundo apellido",
    "gender": "Género",
    "genderUnknown": "Desconocido",
    "genderMale": "Hombre",
    "genderFemale": "Mujer",
    "genderOther": "Otro",
    "birthDate": "Fecha de nacimiento",
    "birthPlace": "Lugar de nacimiento",
    "deathDate": "Fecha de fallecimiento",
    "deathPlace": "Lugar de fallecimiento",
    "photoUrl": "URL de foto",
    "photoUrlPlaceholder": "https://…",
    "bio": "Biografía",
    "successAdd": "Persona añadida",
    "successUpdate": "Persona actualizada"
  },
  "deletePersonButton": {
    "trigger": "Eliminar persona",
    "confirm": "¿Seguro que quieres eliminar esta persona?"
  },
  "personDetailPage": {
    "backToTree": "Volver al árbol",
    "editPerson": "Editar"
  },
  "editPersonPage": {
    "back": "Atrás",
    "title": "Editar persona",
    "submitLabel": "Guardar cambios"
  },
  "newPersonPage": {
    "back": "Volver al árbol",
    "title": "Añadir persona"
  },
  "personCard": {
    "birth": "Nacimiento",
    "death": "Fallecimiento",
    "gender": "Género",
    "bio": "Biografía",
    "alive": "Vivo/a",
    "deceased": "Fallecido/a"
  },
  "personSidebar": {
    "noDetails": "Sin detalles registrados.",
    "birth": "Nacimiento",
    "death": "Fallecimiento",
    "gender": "Género",
    "biography": "Biografía",
    "isSelf": "Soy yo",
    "markAsSelf": "Marcar como yo",
    "addRelative": "Añadir familiar",
    "viewProfile": "Ver perfil completo",
    "kinship": {
      "childOf_male": "Hijo de",
      "childOf_female": "Hija de",
      "childOf_unknown": "Hijo/a de",
      "parentOf_male": "Padre de",
      "parentOf_female": "Madre de",
      "parentOf_unknown": "Progenitor/a de",
      "partnerOf": "Pareja de"
    }
  },
  "relativeSidebar": {
    "title": "Añadir familiar",
    "of": "de {{name}}",
    "relationship": "Relación",
    "partner": "Pareja",
    "child": "Hijo/a",
    "parent": "Padre/Madre",
    "firstName": "Nombre *",
    "firstNamePlaceholder": "Nombre",
    "lastName": "Primer apellido",
    "lastName2": "Segundo apellido",
    "gender": "Género",
    "birthDate": "Fecha de nacimiento",
    "birthPlace": "Lugar de nacimiento",
    "submit": "Añadir {{relationship}}",
    "submitting": "Añadiendo…",
    "successToast": "{{relationship}} añadido/a"
  }
}
```

---

## Fase 3 — Reestructura de rutas

Este es el cambio más invasivo. Todas las rutas bajo `app/` deben moverse dentro de `app/[locale]/`.

### Estructura actual → nueva estructura

```
app/
├── layout.tsx                          → app/layout.tsx (sin cambios)
├── globals.css                         → sin cambios
├── page.tsx                            → app/[locale]/page.tsx
├── (app)/
│   ├── layout.tsx                      → app/[locale]/(app)/layout.tsx
│   ├── dashboard/page.tsx              → app/[locale]/(app)/dashboard/page.tsx
│   └── trees/
│       ├── [treeId]/page.tsx           → app/[locale]/(app)/trees/[treeId]/page.tsx
│       ├── [treeId]/persons/
│       │   ├── new/page.tsx            → app/[locale]/(app)/trees/[treeId]/persons/new/page.tsx
│       │   └── [personId]/
│       │       ├── page.tsx            → app/[locale]/(app)/trees/[treeId]/persons/[personId]/page.tsx
│       │       └── edit/page.tsx       → app/[locale]/(app)/trees/[treeId]/persons/[personId]/edit/page.tsx
│       └── new/page.tsx                → app/[locale]/(app)/trees/new/page.tsx
├── (auth)/
│   ├── login/page.tsx                  → app/[locale]/(auth)/login/page.tsx
│   └── register/page.tsx              → app/[locale]/(auth)/register/page.tsx
└── api/                                → sin cambios (las API routes NO van bajo [locale])
```

> **Importante:** Las rutas bajo `app/api/` **NO** se mueven — los endpoints de API no necesitan locale.

### Nuevo `app/layout.tsx` (root layout)

El root layout existente se convierte en el layout sin locale. Solo sirve para el catch-all de redirección.

```tsx
// app/layout.tsx — sin cambios sustanciales, solo eliminar el <html lang>
// El lang lo pone el layout de [locale]
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children // next-intl gestiona el <html>
}
```

### Nuevo `app/[locale]/layout.tsx`

```tsx
// app/[locale]/layout.tsx
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
```

---

## Fase 4 — Middleware

Reemplazar el `middleware.ts` actual (vacío) con el de `next-intl`:

```ts
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Matcher que excluye API routes, archivos estáticos y _next
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

> **Nota**: Cuando se reactive la autenticación con `next-auth`, habrá que combinar ambos middlewares. Ver el apartado "Consideraciones futuras" al final.

---

## Fase 5 — Adaptar componentes y páginas

Para cada componente/página indicado, sustituir los strings hardcoded por llamadas a `t()`.

### Patrón para Server Components (páginas)

```tsx
import { getTranslations } from 'next-intl/server'

export default async function MyPage() {
  const t = await getTranslations('namespace')
  return <h1>{t('key')}</h1>
}
```

### Patrón para Client Components

```tsx
'use client'
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('namespace')
  return <button>{t('key')}</button>
}
```

---

### Archivos a modificar (con namespace asignado)

| Archivo | Tipo | Namespace |
|---|---|---|
| `app/[locale]/(app)/layout.tsx` | Server | `nav` |
| `app/[locale]/(app)/dashboard/page.tsx` | Server | `dashboard` |
| `app/[locale]/(app)/trees/[treeId]/page.tsx` | Server | `treePage` |
| `app/[locale]/(app)/trees/[treeId]/persons/[personId]/page.tsx` | Server | `personDetailPage` |
| `app/[locale]/(app)/trees/[treeId]/persons/[personId]/edit/page.tsx` | Server | `editPersonPage` |
| `components/tree/CreateTreeForm.tsx` | Client | `createTree` |
| `components/tree/EditTreeForm.tsx` | Client | `editTree` |
| `components/tree/DeleteTreeButton.tsx` | Client | `deleteTree` |
| `components/tree/PersonDetailSidebar.tsx` | Client | `personSidebar` |
| `components/tree/RelativeSidebar.tsx` | Client | `relativeSidebar` |
| `components/person/PersonForm.tsx` | Client | `personForm` |
| `components/person/DeletePersonButton.tsx` | Client | `deletePersonButton` |
| `components/person/PersonCard.tsx` | Client/Server | `personCard` |

---

### Ejemplo concreto: `EditTreeForm.tsx` (Client Component)

**Antes:**
```tsx
'use client'
// ...
toast.success('Lineage records updated')
// ...
<DialogTitle>Amend Records</DialogTitle>
<DialogDescription>Update the title and historical context of this lineage.</DialogDescription>
<label>Tree Name</label>
<Button>{pending ? 'Amending…' : 'Update Records'}</Button>
```

**Después:**
```tsx
'use client'
import { useTranslations } from 'next-intl'
// ...

export function EditTreeForm({ treeId, defaultName, defaultDescription }: Props) {
  const t = useTranslations('editTree')
  // ...
  
  function onSubmit(data: TreeInput) {
    startTransition(async () => {
      const result = await updateTree(treeId, data)
      if (result.success) {
        toast.success(t('successToast'))
        // ...
      }
    })
  }

  return (
    // ...
    <DialogTitle>{t('title')}</DialogTitle>
    <DialogDescription>{t('description')}</DialogDescription>
    <label>{t('nameLabel')}</label>
    <Button>{pending ? t('submitting') : t('submit')}</Button>
  )
}
```

---

### Ejemplo concreto: `DashboardPage` (Server Component)

**Antes:**
```tsx
export default async function DashboardPage() {
  const trees = await getUserTrees()
  return (
    <h1>Your Lineage</h1>
    <p>{trees.length === 0 
      ? "Begin your journey..." 
      : `Overseeing ${trees.length} ${trees.length === 1 ? 'legacy' : 'legacies'}...`
    }</p>
  )
}
```

**Después:**
```tsx
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const trees = await getUserTrees()
  const t = await getTranslations('dashboard')

  return (
    <h1>{t('title')}</h1>
    <p>{trees.length === 0 
      ? t('subtitleEmpty') 
      : t('subtitleCount', { count: trees.length })
    }</p>
  )
}
```

---

### Nota sobre `PersonDetailSidebar.tsx` — kinship labels

La función `kinshipLabels` actual usa lógica condicional con strings hardcoded. Debe refactorizarse para usar el namespace `personSidebar.kinship`:

**Antes:**
```tsx
function kinshipLabels(gender?: string | null) {
  if (gender === 'male')   return { child: 'Hijo de', parent: 'Padre de' }
  if (gender === 'female') return { child: 'Hija de', parent: 'Madre de' }
  return { child: 'Hijo/a de', parent: 'Progenitor/a de' }
}
```

**Después:**
```tsx
// Dentro del componente, con acceso a t = useTranslations('personSidebar')
function getKinshipLabels(gender?: string | null) {
  const suffix = gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'unknown'
  return {
    child: t(`kinship.childOf_${suffix}`),
    parent: t(`kinship.parentOf_${suffix}`),
  }
}
```

---

## Fase 6 — Tipado TypeScript (opcional pero recomendado)

Para obtener autocompletado y detección de claves inexistentes, crear `global.d.ts` en la raíz:

```ts
// global.d.ts
import en from './messages/en.json'

type Messages = typeof en

declare global {
  interface IntlMessages extends Messages {}
}
```

Esto hará que TypeScript valide que todas las claves usadas en `t('...')` existen en `en.json`.

---

## Fase 7 — Helpers de navegación tipados (recomendado)

`next-intl` provee wrappers tipados para `Link`, `useRouter`, `redirect` y `usePathname` que incluyen el locale automáticamente:

```ts
// i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, useRouter, usePathname, redirect } = createNavigation(routing)
```

Sustituir los imports de `next/link` y `next/navigation` por este módulo en todos los componentes/páginas. Esto garantiza que los links siempre incluyan el locale correcto (ej. `/en/dashboard` en vez de `/dashboard`).

> **Importante**: Hacer este reemplazo en todos los archivos al mismo tiempo para evitar links rotos.

---

## Orden de implementación recomendado

```
[ ] 1. Instalar next-intl
[ ] 2. Crear i18n/routing.ts e i18n/request.ts
[ ] 3. Actualizar next.config.ts
[ ] 4. Crear messages/en.json y messages/es.json
[ ] 5. Crear global.d.ts para tipado
[ ] 6. Crear i18n/navigation.ts
[ ] 7. Mover rutas bajo app/[locale]/ (cambio de carpetas)
[ ] 8. Crear app/[locale]/layout.tsx con NextIntlClientProvider
[ ] 9. Actualizar middleware.ts
[ ] 10. Adaptar Server Components (páginas) → getTranslations
[ ] 11. Adaptar Client Components → useTranslations
[ ] 12. Reemplazar imports de next/link y next/navigation por i18n/navigation
[ ] 13. Verificar que todas las rutas hardcoded (/dashboard, /trees/...) mantienen el prefijo de locale
[ ] 14. Probar en ambos idiomas: /en/dashboard y /es/dashboard
```

---

## Consideraciones futuras

### Reactivación de next-auth

Cuando se reactive la autenticación, el middleware necesitará combinar `next-intl` con `next-auth`. El patrón recomendado es:

```ts
// middleware.ts
import { auth } from './auth'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default auth((req) => {
  if (!req.auth && !req.nextUrl.pathname.includes('/login')) {
    return Response.redirect(new URL(`/${routing.defaultLocale}/login`, req.url))
  }
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

### Selector de idioma en la UI

Una vez implementado lo anterior, se puede añadir un selector de idioma en `app/[locale]/(app)/layout.tsx` usando `usePathname` y `useRouter` de `i18n/navigation.ts`:

```tsx
'use client'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useLocale } from 'next-intl'

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  return (
    <button onClick={() => router.replace(pathname, { locale: locale === 'en' ? 'es' : 'en' })}>
      {locale === 'en' ? 'ES' : 'EN'}
    </button>
  )
}
```

---

## Archivos nuevos creados por este plan

| Ruta | Descripción |
|---|---|
| `i18n/routing.ts` | Locales disponibles y locale por defecto |
| `i18n/request.ts` | Carga de mensajes para Server Components |
| `i18n/navigation.ts` | Link, useRouter, redirect tipados con locale |
| `messages/en.json` | Todos los strings en inglés |
| `messages/es.json` | Todos los strings en español |
| `global.d.ts` | Tipos TypeScript para autocompletado de claves |
| `app/[locale]/layout.tsx` | Layout raíz con NextIntlClientProvider |
