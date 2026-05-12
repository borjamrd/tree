# TRE — Genealogy Tree App: Implementation Plan

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| Tree UI | React Flow |
| Package manager | pnpm |

## Critical: Read Before Writing Any Next.js Code

**AGENTS.md warns that this project runs Next.js 16.2.6 which has breaking changes.**
Before writing any route handlers, server actions, or middleware:

```bash
ls node_modules/next/dist/docs/
```

Read the relevant docs there. Do NOT assume behavior from training data.

---

## Project Structure (target)

```
tre/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              ← protected layout with sidebar
│   │   ├── dashboard/page.tsx      ← list of user's trees
│   │   ├── trees/
│   │   │   ├── new/page.tsx
│   │   │   └── [treeId]/
│   │   │       ├── page.tsx        ← tree canvas (React Flow)
│   │   │       ├── persons/
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [personId]/
│   │   │       │       ├── page.tsx        ← person detail + card preview
│   │   │       │       └── edit/page.tsx
│   │   │       └── settings/page.tsx
│   └── api/
│       └── auth/[...all]/route.ts
├── components/
│   ├── tree/
│   │   ├── TreeCanvas.tsx          ← React Flow wrapper
│   │   ├── PersonNode.tsx          ← custom React Flow node
│   │   ├── UnionNode.tsx           ← virtual union node
│   │   └── TreeControls.tsx        ← zoom, fit, add person buttons
│   ├── person/
│   │   ├── PersonCard.tsx          ← portrait card component
│   │   ├── PersonForm.tsx
│   │   └── PersonCardPrint.tsx     ← print-optimized version
│   └── ui/                         ← shadcn/ui components
├── lib/
│   ├── db/
│   │   ├── index.ts                ← drizzle instance
│   │   └── schema.ts               ← all table definitions
│   ├── auth.ts                     ← Better Auth server config
│   ├── auth-client.ts              ← Better Auth client config
│   └── utils.ts
├── server/
│   ├── trees.ts                    ← server actions: trees CRUD
│   ├── persons.ts                  ← server actions: persons CRUD
│   └── relationships.ts            ← server actions: unions + parentage
└── docs/
    └── PLAN.md                     ← this file
```

---

## Phase 0 — Dependencies & Infrastructure

### Install dependencies

```bash
# Database & ORM
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Auth
pnpm add better-auth

# Tree visualization
pnpm add @xyflow/react

# UI
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# Export
pnpm add html-to-image
```

> **Note on DB driver**: Use `@neondatabase/serverless` for Neon Postgres (serverless-friendly). If using local Postgres instead, use `postgres` package and replace `neon()` with `postgres()` in `lib/db/index.ts`.

### Environment variables

Create `.env.local`:

```env
DATABASE_URL="postgres://..."
BETTER_AUTH_SECRET="..."           # generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
# GITHUB_CLIENT_ID="..."
# GITHUB_CLIENT_SECRET="..."
```

### Drizzle config

Create `drizzle.config.ts` at project root:

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

Add scripts to `package.json`:

```json
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

---

## Phase 1 — Database Schema

File: `lib/db/schema.ts`

### Complete schema

```typescript
import {
  pgTable, uuid, text, boolean, date, timestamp,
  pgEnum, index, unique
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ───────────────────────────────────────────────────────────────────

export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'unknown'])
export const unionTypeEnum = pgEnum('union_type', ['married', 'partnered', 'divorced', 'separated', 'unknown'])
export const parentageTypeEnum = pgEnum('parentage_type', ['biological', 'adoptive', 'step', 'foster', 'unknown'])

// ─── Users ───────────────────────────────────────────────────────────────────

// Better Auth required tables
export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verifications = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// ─── Trees ───────────────────────────────────────────────────────────────────

export const trees = pgTable('trees', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [index('trees_user_idx').on(t.userId)])

// ─── Persons ─────────────────────────────────────────────────────────────────

export const persons = pgTable('persons', {
  id: uuid('id').primaryKey().defaultRandom(),
  treeId: uuid('tree_id').notNull().references(() => trees.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  maidenName: text('maiden_name'),
  gender: genderEnum('gender').default('unknown').notNull(),
  birthDate: date('birth_date'),
  birthPlace: text('birth_place'),
  deathDate: date('death_date'),
  deathPlace: text('death_place'),
  isAlive: boolean('is_alive').default(true).notNull(),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  // Canvas position for React Flow
  posX: text('pos_x').default('0'),
  posY: text('pos_y').default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [index('persons_tree_idx').on(t.treeId)])

// ─── Unions ──────────────────────────────────────────────────────────────────
// Represents a couple (or single-parent unit). Core entity for genealogy.
// person2Id is nullable to support single-parent families.

export const unions = pgTable('unions', {
  id: uuid('id').primaryKey().defaultRandom(),
  treeId: uuid('tree_id').notNull().references(() => trees.id, { onDelete: 'cascade' }),
  person1Id: uuid('person1_id').notNull().references(() => persons.id, { onDelete: 'cascade' }),
  person2Id: uuid('person2_id').references(() => persons.id, { onDelete: 'set null' }),
  type: unionTypeEnum('type').default('unknown').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  notes: text('notes'),
  // Canvas position for the virtual union node in React Flow
  posX: text('pos_x').default('0'),
  posY: text('pos_y').default('0'),
}, (t) => [index('unions_tree_idx').on(t.treeId)])

// ─── Parentage ───────────────────────────────────────────────────────────────
// Links a child to the union that produced them.

export const parentage = pgTable('parentage', {
  id: uuid('id').primaryKey().defaultRandom(),
  childId: uuid('child_id').notNull().references(() => persons.id, { onDelete: 'cascade' }),
  unionId: uuid('union_id').notNull().references(() => unions.id, { onDelete: 'cascade' }),
  type: parentageTypeEnum('type').default('biological').notNull(),
}, (t) => [
  index('parentage_child_idx').on(t.childId),
  index('parentage_union_idx').on(t.unionId),
  unique('unique_child_union').on(t.childId, t.unionId),
])

// ─── Relations (Drizzle query API) ───────────────────────────────────────────

export const treesRelations = relations(trees, ({ many }) => ({
  persons: many(persons),
  unions: many(unions),
}))

export const personsRelations = relations(persons, ({ one, many }) => ({
  tree: one(trees, { fields: [persons.treeId], references: [trees.id] }),
  childOf: many(parentage),
  unions1: many(unions, { relationName: 'person1' }),
  unions2: many(unions, { relationName: 'person2' }),
}))

export const unionsRelations = relations(unions, ({ one, many }) => ({
  tree: one(trees, { fields: [unions.treeId], references: [trees.id] }),
  person1: one(persons, { fields: [unions.person1Id], references: [persons.id], relationName: 'person1' }),
  person2: one(persons, { fields: [unions.person2Id], references: [persons.id], relationName: 'person2' }),
  children: many(parentage),
}))

export const parentageRelations = relations(parentage, ({ one }) => ({
  child: one(persons, { fields: [parentage.childId], references: [persons.id] }),
  union: one(unions, { fields: [parentage.unionId], references: [unions.id] }),
}))
```

After writing the schema, run:

```bash
pnpm db:push
```

---

## Phase 2 — Authentication

### `lib/auth.ts` (Server)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    // socialProviders: {
    //    github: {
    //        clientId: process.env.GITHUB_CLIENT_ID!,
    //        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    //    }
    // }
});
```

### `lib/auth-client.ts` (Client)

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL
})
```

### `app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### Middleware (`middleware.ts` at project root)

```typescript
import { betterFetch } from "@better-auth/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "better-auth/types";

export default async function authMiddleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>(
		"/api/auth/get-session",
		{
			baseURL: request.nextUrl.origin,
			headers: {
				//get the cookie from the request
				cookie: request.headers.get("cookie") || "",
			},
		},
	);

	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/trees/:path*"],
};
```

### Auth pages

- `app/(auth)/login/page.tsx` — uses `authClient.signIn.email()`
- `app/(auth)/register/page.tsx` — uses `authClient.signUp.email()`

---

## Phase 3 — Server Actions

### Convention

All mutations use Next.js Server Actions. Define them in `server/` files, each exported as `async function` with `'use server'` directive at the top of the file.

Validation: Use **Zod** for all input validation before hitting the DB.

Authorization: Every action must verify that `session.user.id` owns the resource being modified.

### `server/trees.ts`

```typescript
'use server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { trees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const createTreeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export async function createTree(input: z.infer<typeof createTreeSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) throw new Error('Unauthorized')

  const data = createTreeSchema.parse(input)
  const [tree] = await db.insert(trees).values({
    ...data,
    userId: session.user.id,
  }).returning()

  revalidatePath('/dashboard')
  return tree
}

export async function getUserTrees() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) throw new Error('Unauthorized')

  return db.query.trees.findMany({
    where: eq(trees.userId, session.user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
}

export async function deleteTree(treeId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) throw new Error('Unauthorized')

  await db.delete(trees).where(
    and(eq(trees.id, treeId), eq(trees.userId, session.user.id))
  )
  revalidatePath('/dashboard')
}
```

### `server/persons.ts`

Actions to implement:

| Action | Description |
|---|---|
| `createPerson(treeId, data)` | Add person to tree. Verify tree ownership. |
| `updatePerson(personId, data)` | Update person fields. |
| `deletePerson(personId)` | Delete person (cascades to unions + parentage). |
| `updatePersonPosition(personId, x, y)` | Update canvas position from React Flow drag. |
| `getTreePersons(treeId)` | Return all persons for a tree. |

### `server/relationships.ts`

Actions to implement:

| Action | Description |
|---|---|
| `createUnion(treeId, person1Id, person2Id?, type)` | Create a couple/union. |
| `updateUnion(unionId, data)` | Update union details. |
| `deleteUnion(unionId)` | Delete union (cascades to parentage). |
| `addChild(unionId, childId, parentageType)` | Link a child to a union. |
| `removeChild(parentageId)` | Remove child from union. |
| `getTreeRelationships(treeId)` | Return all unions + parentage for a tree. |

---

## Phase 4 — Tree Visualization (React Flow)

This is the most complex phase. Follow these steps carefully.

### Data model → React Flow nodes and edges

The tree canvas has **three node types**:

| Type | Maps to | Visual |
|---|---|---|
| `person` | `persons` table row | Card with name, dates, photo |
| `union` | `unions` table row | Small diamond/dot node |
| `parentage-edge` | Rendered as edge | Line from union node to child node |
| `partner-edge` | Rendered as edge | Line from person1 to union to person2 |

### `components/tree/TreeCanvas.tsx`

This is the main React Flow canvas. It is a **Client Component** (`'use client'`).

Steps:
1. Receive `persons`, `unions`, `parentage` as props (fetched server-side in the page)
2. Transform them into React Flow `nodes` and `edges` arrays (see transformer below)
3. Render `<ReactFlow>` with custom node types
4. Handle `onNodesChange` to persist position updates via `updatePersonPosition` server action (debounced, 500ms)
5. Add toolbar buttons: zoom in/out, fit view, add person

### Data transformer: DB → React Flow

```typescript
// lib/tree-transform.ts
import type { Node, Edge } from '@xyflow/react'

export function treeToFlow(persons, unions, parentage): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Person nodes
  for (const p of persons) {
    nodes.push({
      id: p.id,
      type: 'person',
      position: { x: Number(p.posX), y: Number(p.posY) },
      data: p,
    })
  }

  // Union nodes (virtual, positioned between their two persons)
  for (const u of unions) {
    nodes.push({
      id: `union-${u.id}`,
      type: 'union',
      position: { x: Number(u.posX), y: Number(u.posY) },
      data: u,
    })
    // Edge: person1 → union
    edges.push({
      id: `e-p1-${u.id}`,
      source: u.person1Id,
      target: `union-${u.id}`,
      type: 'smoothstep',
    })
    // Edge: person2 → union (if exists)
    if (u.person2Id) {
      edges.push({
        id: `e-p2-${u.id}`,
        source: u.person2Id,
        target: `union-${u.id}`,
        type: 'smoothstep',
      })
    }
  }

  // Parentage edges: union → child
  for (const par of parentage) {
    edges.push({
      id: `e-par-${par.id}`,
      source: `union-${par.unionId}`,
      target: par.childId,
      type: 'smoothstep',
    })
  }

  return { nodes, edges }
}
```

### `components/tree/PersonNode.tsx`

Custom React Flow node. Must be registered in `nodeTypes` prop of `<ReactFlow>`.

```typescript
'use client'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'

export function PersonNode({ data }: NodeProps) {
  return (
    <div className="w-40 rounded-xl border border-stone-200 bg-white shadow-sm p-3">
      <Handle type="target" position={Position.Top} />
      {data.photoUrl && (
        <img src={data.photoUrl} className="w-10 h-10 rounded-full mx-auto mb-2 object-cover" />
      )}
      <p className="text-sm font-medium text-center text-stone-800 truncate">
        {data.firstName} {data.lastName}
      </p>
      {data.birthDate && (
        <p className="text-xs text-stone-400 text-center mt-0.5">
          {data.birthDate}{data.deathDate ? ` – ${data.deathDate}` : ''}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
```

### `components/tree/UnionNode.tsx`

Small visual connector node:

```typescript
'use client'
import { Handle, Position } from '@xyflow/react'

export function UnionNode() {
  return (
    <div className="w-3 h-3 rounded-full bg-stone-400 border-2 border-white shadow">
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
```

### Tree page (`app/(app)/trees/[treeId]/page.tsx`)

Server component that fetches all data and passes to canvas:

```typescript
import { getTreePersons } from '@/server/persons'
import { getTreeRelationships } from '@/server/relationships'
import { TreeCanvas } from '@/components/tree/TreeCanvas'

export default async function TreePage({ params }: { params: { treeId: string } }) {
  const [persons, { unions, parentage }] = await Promise.all([
    getTreePersons(params.treeId),
    getTreeRelationships(params.treeId),
  ])

  return (
    <div className="h-screen w-full">
      <TreeCanvas persons={persons} unions={unions} parentage={parentage} />
    </div>
  )
}
```

---

## Phase 5 — Portrait Cards

### Design spec

Each person has a "card" view suitable for printing. The card shows:

```
┌─────────────────────────────────┐
│  [photo, 80x80 rounded]         │
│                                 │
│  FIRSTNAME LASTNAME             │
│  ──────────────────────         │
│  Born   12 March 1920           │
│         Warsaw, Poland          │
│                                 │
│  Died   4 June 1989             │
│         London, UK              │
│                                 │
│  [bio text, truncated 3 lines]  │
└─────────────────────────────────┘
```

### `components/person/PersonCard.tsx`

- White background, subtle shadow, rounded corners
- Elegant serif font for name (use `font-serif` or import from Google Fonts)
- Monochrome/muted palette — stone/slate colors
- Responsive: looks good at both screen and print sizes

### Print / export flow

1. User clicks "Export Card" on person detail page
2. Uses `html-to-image` to capture the card as PNG:

```typescript
import { toPng } from 'html-to-image'

async function downloadCard(ref: React.RefObject<HTMLDivElement>, name: string) {
  const dataUrl = await toPng(ref.current!, { quality: 0.95, pixelRatio: 2 })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${name}-card.png`
  a.click()
}
```

3. For printing the full tree: CSS `@media print` styles that show a grid of all person cards.

---

## Phase 6 — Dashboard & Navigation

### Dashboard (`app/(app)/dashboard/page.tsx`)

- Lists all trees for the current user
- Card per tree: name, person count, created date
- "New tree" button → modal or inline form
- Empty state: clear CTA to create first tree

### App layout (`app/(app)/layout.tsx`)

Minimal sidebar:
- App logo/name
- Link to Dashboard
- Link to current tree (if any)
- User avatar + logout

---

## Phase 7 — UI Polish

### Design principles

- **Palette**: stone/slate/neutral — warm whites, not pure white backgrounds
- **Typography**: Inter for UI, a serif (Lora, Playfair Display) for names in cards
- **Borders**: soft, `border-stone-100` or `border-stone-200`
- **Shadows**: subtle, `shadow-sm` maximum on cards
- **Radii**: generous, `rounded-xl` on cards, `rounded-lg` on inputs

### shadcn/ui components to install

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label dialog select sheet toast
```

---

## Phase 8 — Validation & Error Handling

- All Zod schemas in `lib/validations.ts` (shared between client and server)
- Server actions return `{ success: boolean, data?: T, error?: string }` — never throw to client
- React Hook Form + Zod resolver on all forms
- `toast()` notifications for success/error feedback

---

## Suggested Implementation Order

1. **Phase 0** — Install deps, env vars, drizzle config
2. **Phase 1** — Write schema, run `db:push`, verify in `db:studio`
3. **Phase 2** — Auth setup: login/register pages, middleware, session working
4. **Phase 3** — Server actions: trees CRUD + dashboard page working end-to-end
5. **Phase 3** — Server actions: persons CRUD + person form/detail pages
6. **Phase 3** — Server actions: relationships (unions + parentage)
7. **Phase 4** — Tree canvas: React Flow with person nodes rendering, positions saving
8. **Phase 4** — Add person to canvas flow: button → form → new node appears
9. **Phase 4** — Add relationship flow: connect two persons → creates union
10. **Phase 5** — Portrait cards component + export button
11. **Phase 6** — Dashboard polish, empty states
12. **Phase 7** — UI polish pass, fonts, spacing, print CSS

---

## Key Constraints & Decisions

| Decision | Rationale |
|---|---|
| Union node as first-class entity | Required for correct half-sibling modeling |
| Canvas position stored in DB | Persists layout across sessions |
| Server Actions over API routes | Simpler, type-safe, colocated with data |
| No client-side state management (no Zustand/Redux) | Server Actions + React state is sufficient |
| pnpm only | Do not use npm or yarn commands |
| `person2Id` nullable in unions | Supports single-parent families without hacks |

---

## Out of Scope (for later)

- AI portrait generation from uploaded photos
- Sharing trees with other users (collaboration)
- Import from GEDCOM format
- DNA / genetic relationships
- Timeline view
- Mobile app
