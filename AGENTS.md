<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Standards

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Database**: Neon (serverless Postgres) via `@neondatabase/serverless`
- **ORM**: Drizzle ORM — schema at `lib/db/schema.ts`, client at `lib/db/index.ts`
- **Auth**: Better Auth v1 — config at `lib/auth.ts`, client at `lib/auth-client.ts`
- **Styling**: Tailwind CSS v4
- **UI primitives**: Radix UI + shadcn-style components in `components/ui/`
- **Forms**: React Hook Form + Zod v4 — validations at `lib/validations.ts`
- **i18n**: next-intl, locales `en` + `es`, routing via `i18n/routing.ts`
- **Canvas**: `@xyflow/react` for the family tree visualization

## File Structure

```
app/[locale]/
  (auth)/login|register/     # Public auth pages
  (app)/dashboard/           # Protected: tree list
  (app)/trees/[treeId]/      # Protected: tree canvas
lib/
  auth.ts                    # Better Auth server config
  auth-client.ts             # Better Auth browser client
  get-session.ts             # requireUser() / getSession()
  db/
    index.ts                 # drizzle client (neon-http)
    schema.ts                # all tables + relations
  validations.ts             # Zod schemas for server actions
server/
  trees.ts                   # Server Actions for trees
  persons.ts                 # Server Actions for persons
  relationships.ts           # Server Actions for relationships
components/
  tree/                      # Canvas + sidebar components
  person/                    # Person form + card
  ui/                        # Radix-based primitives
```

## Domain Model

The family tree is built from three tables:

- **persons** — nodes on the canvas, one per individual, with `isSelf` marking the tree owner. Position stored as `posX/posY` text fields.
- **unions** — a couple relationship between two persons (or one person with `person2Id` null). Acts as a "virtual node" on the canvas.
- **parentage** — links a child person to a union, with `type` (biological/adoptive/step/foster).

Key constraints: only one `isSelf = true` per tree (partial unique index). `person2Id` in unions is nullable (single-parent unions).

## Authentication & Session Management

- **Better Auth Only** — migrated from NextAuth.
- **PROHIBITED**: NEVER use `devSession` from `@/lib/dev-session`. Deprecated and insecure.
- **Server Components / Actions**: use `requireUser()` (throws if unauth) or `getSession()` from `@/lib/get-session`.
- **Client Components**: use `authClient` from `@/lib/auth-client`.
- **Middleware**: protects `/dashboard` and `/trees` routes, redirects to `/login` if no session.

## Server Actions Pattern

All server mutations live in `server/` as `'use server'` files. Return a discriminated union:

```ts
type Result<T = void> = { success: true; data?: T } | { success: false; error: string }
```

Always call `requireUser()` first. Use Zod to parse input. Call `revalidatePath` after mutations.

## Development Flow

Use `/feature-flow "feature name"` to start or resume a feature. The skill orchestrates analysis → FRD → test planning → user confirmation → implementation → review. State persists in `.claude/features/<slug>/state.json` and outputs sync to Obsidian. Resume any interrupted feature by invoking the skill again with the same name.

## UI/UX & Design

- **MANDATORY**: For ANY modification or creation of visual components, pages, or UI elements, you MUST follow the instructions in `.agents/skills/frontend-design/SKILL.md`.
- **Aesthetics**: Avoid generic AI aesthetics. Prioritize distinctive typography, intentional spatial composition, and refined visual details. Every UI change should feel production-grade and premium.
- **Tools**: Use CSS variables for theming and coordinate with the existing design system.
