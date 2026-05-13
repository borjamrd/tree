# Collaborative Trees — Implementation Plan

## Design Decisions (settled, do not revisit)

| Aspect | Decision |
|---|---|
| Collaborator permissions | Full access (create/edit/delete persons, unions, parentage) except: delete tree, manage members |
| Admin permissions | Everything, including delete tree and manage members |
| Invitation mechanism | Email with tokenized acceptance link (Resend) |
| Collaborator limit | Max 3 per tree, admin does not occupy a slot |
| Slot reservation | Slot is reserved at invite time (pending counts against limit) |
| Invitation expiry | 7 days from `invitedAt` |
| Removed collaborator data | Nodes remain in the tree — data belongs to the tree, not the user |
| Attribution | `createdBy` (FK → user) added to `persons`, `unions`, `parentage` |
| Real-time sync | None in v1 — eventual consistency, users refresh to see changes |
| Notifications | None in v1 |
| Account deletion guard | Block if user has trees with pending/accepted collaborators |
| Dashboard display | Shared trees appear alongside own trees with an `isShared` visual badge |

---

## Stack additions

```bash
pnpm add resend react-email @react-email/components
```

New environment variables (add to `.env.local`):

```env
RESEND_API_KEY="re_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"   # used to build invite links
```

---

## Phase 1 — Schema Changes

File: `lib/db/schema.ts`

### 1.1 New enum

```typescript
export const memberStatusEnum = pgEnum('member_status', ['pending', 'accepted', 'revoked'])
```

### 1.2 New table: `tree_members`

Add after the `trees` table definition:

```typescript
export const treeMembers = pgTable('tree_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  treeId: uuid('tree_id').notNull().references(() => trees.id, { onDelete: 'cascade' }),
  // null while invitation is pending (user may not exist yet)
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  invitedEmail: text('invited_email').notNull(),
  inviteToken: text('invite_token').notNull().unique(),
  status: memberStatusEnum('status').default('pending').notNull(),
  invitedBy: text('invited_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  expiresAt: timestamp('expires_at').notNull(),
}, (t) => [
  index('tree_members_tree_idx').on(t.treeId),
  index('tree_members_user_idx').on(t.userId),
  index('tree_members_token_idx').on(t.inviteToken),
  // prevent duplicate active invitations for the same email on the same tree
  unique('unique_tree_email').on(t.treeId, t.invitedEmail),
])
```

### 1.3 Add `createdBy` to `persons`, `unions`, `parentage`

In the `persons` table definition, add before `createdAt`:

```typescript
createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
```

In the `unions` table definition, add before the closing `}`:

```typescript
createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
```

In the `parentage` table definition, add before the closing `}`:

```typescript
createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
```

### 1.4 Add Drizzle relations for `treeMembers`

```typescript
export const treeMembersRelations = relations(treeMembers, ({ one }) => ({
  tree: one(trees, { fields: [treeMembers.treeId], references: [trees.id] }),
  user: one(users, { fields: [treeMembers.userId], references: [users.id] }),
  inviter: one(users, { fields: [treeMembers.invitedBy], references: [users.id], relationName: 'inviter' }),
}))
```

Also extend `treesRelations` to include members:

```typescript
export const treesRelations = relations(trees, ({ many }) => ({
  persons: many(persons),
  unions: many(unions),
  members: many(treeMembers),
}))
```

### 1.5 Migration

After editing `schema.ts`, run:

```bash
pnpm db:push
```

Verify in `pnpm db:studio` that:
- `tree_members` table exists with all columns
- `persons.created_by`, `unions.created_by`, `parentage.created_by` columns exist as nullable

---

## Phase 2 — Authorization Helpers

Create `lib/tree-access.ts`. This centralizes all access-control logic and is the single place to update if roles ever expand.

```typescript
import { db } from '@/lib/db'
import { trees, treeMembers } from '@/lib/db/schema'
import { and, eq, or, count } from 'drizzle-orm'

/**
 * Returns the tree if the user is the owner OR an accepted collaborator.
 * Throws if no access.
 */
export async function requireTreeAccess(treeId: string, userId: string) {
  const tree = await db.query.trees.findFirst({
    where: eq(trees.id, treeId),
  })
  if (!tree) throw new Error('Tree not found')

  if (tree.userId === userId) return { tree, role: 'admin' as const }

  const membership = await db.query.treeMembers.findFirst({
    where: and(
      eq(treeMembers.treeId, treeId),
      eq(treeMembers.userId, userId),
      eq(treeMembers.status, 'accepted')
    ),
  })
  if (!membership) throw new Error('Tree not found')

  return { tree, role: 'collaborator' as const }
}

/**
 * Returns the tree only if the user is the owner (admin-only operations).
 * Throws if not owner.
 */
export async function requireTreeAdmin(treeId: string, userId: string) {
  const tree = await db.query.trees.findFirst({
    where: and(eq(trees.id, treeId), eq(trees.userId, userId)),
  })
  if (!tree) throw new Error('Tree not found or insufficient permissions')
  return tree
}

/**
 * Counts active slots (pending + accepted) for a tree.
 */
export async function getActiveSlotCount(treeId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(treeMembers)
    .where(
      and(
        eq(treeMembers.treeId, treeId),
        or(
          eq(treeMembers.status, 'pending'),
          eq(treeMembers.status, 'accepted')
        )
      )
    )
  return result[0]?.count ?? 0
}
```

---

## Phase 3 — Refactor Existing Server Actions

### 3.1 `server/persons.ts`

Replace the two private helpers:

```typescript
// OLD — delete these two functions:
async function verifyTreeOwnership(treeId: string, userId: string) { ... }
async function verifyPersonOwnership(personId: string, userId: string) { ... }
```

```typescript
// NEW — import and use requireTreeAccess from lib/tree-access.ts
import { requireTreeAccess } from '@/lib/tree-access'
```

Update `verifyPersonOwnership` equivalent inline. When a server action needs to find a person and verify access, the pattern becomes:

```typescript
const person = await db.query.persons.findFirst({
  where: eq(persons.id, personId),
  with: { tree: true },
})
if (!person) throw new Error('Person not found')
await requireTreeAccess(person.treeId, user.id)  // throws if no access
```

**For each person mutation (`createPerson`, `updatePerson`, `deletePerson`, `updatePersonPosition`, `setPersonAsSelf`):**
- Replace `verifyTreeOwnership(treeId, user.id)` with `await requireTreeAccess(treeId, user.id)`
- Replace `verifyPersonOwnership(personId, user.id)` with the inline pattern above

**For `createPerson` and `createUnion`:** pass `createdBy: user.id` in the insert values.

Updated `createPerson`:

```typescript
export async function createPerson(
  treeId: string,
  input: PersonInput
): Promise<Result<typeof persons.$inferSelect>> {
  try {
    const user = await requireUser()
    await requireTreeAccess(treeId, user.id)
    const data = sanitize(personSchema.parse(input))
    const [person] = await db.insert(persons).values({ ...data, treeId, createdBy: user.id }).returning()
    revalidatePath(`/trees/${treeId}`)
    return { success: true, data: person }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create person' }
  }
}
```

**For `getTreePersons`:** replace `verifyTreeOwnership` with `requireTreeAccess`.

### 3.2 `server/relationships.ts`

Same pattern: replace ownership checks with `requireTreeAccess`. Pass `createdBy: user.id` when inserting unions and parentage rows.

### 3.3 `server/trees.ts`

- `getUserTrees` → see Phase 6 (dashboard query changes)
- `getTree` → replace `eq(trees.userId, user.id)` with `requireTreeAccess(treeId, user.id)`
- `updateTree` → replace ownership check with `requireTreeAccess(treeId, user.id)`
- `deleteTree` → keep `requireTreeAdmin(treeId, user.id)` (admin-only)

---

## Phase 4 — Invitation Server Actions

Create `server/collaboration.ts`:

```typescript
'use server'
import { requireUser } from '@/lib/get-session'
import { db } from '@/lib/db'
import { treeMembers, trees, users } from '@/lib/db/schema'
import { and, eq, or } from 'drizzle-orm'
import { requireTreeAdmin, getActiveSlotCount } from '@/lib/tree-access'
import { sendInvitationEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MAX_COLLABORATORS = 3
const INVITE_TTL_DAYS = 7

type Result<T = void> = { success: true; data?: T } | { success: false; error: string }

// ─── Invite a collaborator ────────────────────────────────────────────────────

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

    // Cannot invite yourself
    if (email === user.email) {
      return { success: false, error: 'You cannot invite yourself' }
    }

    // Check slot availability
    const activeSlots = await getActiveSlotCount(treeId)
    if (activeSlots >= MAX_COLLABORATORS) {
      return { success: false, error: `This tree has reached the maximum of ${MAX_COLLABORATORS} collaborators` }
    }

    // Check for existing active invitation for this email
    const existing = await db.query.treeMembers.findFirst({
      where: and(
        eq(treeMembers.treeId, treeId),
        eq(treeMembers.invitedEmail, email),
        or(eq(treeMembers.status, 'pending'), eq(treeMembers.status, 'accepted'))
      ),
    })
    if (existing) {
      return { success: false, error: 'This email already has access or a pending invitation' }
    }

    // Generate token and expiry
    const inviteToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS)

    await db.insert(treeMembers).values({
      treeId,
      invitedEmail: email,
      inviteToken,
      status: 'pending',
      invitedBy: user.id,
      expiresAt,
    })

    await sendInvitationEmail({
      to: email,
      inviterName: user.name,
      treeName: tree.name,
      token: inviteToken,
    })

    revalidatePath(`/trees/${treeId}/settings`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to send invitation' }
  }
}

// ─── Accept invitation ────────────────────────────────────────────────────────

export async function acceptInvitation(token: string): Promise<Result<{ treeId: string }>> {
  try {
    const user = await requireUser()

    const invitation = await db.query.treeMembers.findFirst({
      where: and(
        eq(treeMembers.inviteToken, token),
        eq(treeMembers.status, 'pending')
      ),
    })

    if (!invitation) {
      return { success: false, error: 'Invitation not found or already used' }
    }

    if (new Date() > invitation.expiresAt) {
      return { success: false, error: 'This invitation has expired' }
    }

    // Verify the logged-in user's email matches the invited email
    if (user.email !== invitation.invitedEmail) {
      return { success: false, error: `This invitation was sent to ${invitation.invitedEmail}. Please sign in with that account.` }
    }

    await db.update(treeMembers)
      .set({
        status: 'accepted',
        userId: user.id,
        acceptedAt: new Date(),
      })
      .where(eq(treeMembers.id, invitation.id))

    revalidatePath('/dashboard')
    return { success: true, data: { treeId: invitation.treeId } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to accept invitation' }
  }
}

// ─── Revoke invitation or remove collaborator ─────────────────────────────────

export async function removeMember(memberId: string): Promise<Result> {
  try {
    const user = await requireUser()

    const member = await db.query.treeMembers.findFirst({
      where: eq(treeMembers.id, memberId),
    })
    if (!member) return { success: false, error: 'Member not found' }

    await requireTreeAdmin(member.treeId, user.id)

    await db.update(treeMembers)
      .set({ status: 'revoked' })
      .where(eq(treeMembers.id, memberId))

    revalidatePath(`/trees/${member.treeId}/settings`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to remove member' }
  }
}

// ─── List members for a tree ──────────────────────────────────────────────────

export async function getTreeMembers(treeId: string) {
  const user = await requireUser()
  await requireTreeAdmin(treeId, user.id)

  return db.query.treeMembers.findMany({
    where: and(
      eq(treeMembers.treeId, treeId),
      or(eq(treeMembers.status, 'pending'), eq(treeMembers.status, 'accepted'))
    ),
    with: { user: true },
    orderBy: (m, { asc }) => [asc(m.invitedAt)],
  })
}
```

---

## Phase 5 — Email Service

Create `lib/email.ts`:

```typescript
import { Resend } from 'resend'
import { InvitationEmail } from '@/emails/invitation'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendInvitationParams {
  to: string
  inviterName: string
  treeName: string
  token: string
}

export async function sendInvitationEmail({ to, inviterName, treeName, token }: SendInvitationParams) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`

  await resend.emails.send({
    from: 'TRE <noreply@yourdomain.com>',  // replace with verified Resend domain
    to,
    subject: `${inviterName} invited you to collaborate on "${treeName}"`,
    react: InvitationEmail({ inviterName, treeName, acceptUrl }),
  })
}
```

Create `emails/invitation.tsx` (React Email template):

```tsx
import {
  Body, Button, Container, Head, Heading,
  Html, Preview, Section, Text
} from '@react-email/components'

interface Props {
  inviterName: string
  treeName: string
  acceptUrl: string
}

export function InvitationEmail({ inviterName, treeName, acceptUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to collaborate on a family tree</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f7f4', padding: '40px 0' }}>
        <Container style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', padding: '40px' }}>
          <Heading style={{ fontSize: '22px', fontWeight: '600', color: '#1c1917' }}>
            You're invited to "{treeName}"
          </Heading>
          <Text style={{ color: '#57534e', fontSize: '15px', lineHeight: '1.6' }}>
            {inviterName} has invited you to collaborate on their family tree. Click below to accept the invitation.
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button
              href={acceptUrl}
              style={{
                backgroundColor: '#1c1917',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
              }}
            >
              Accept invitation
            </Button>
          </Section>
          <Text style={{ color: '#a8a29e', fontSize: '13px' }}>
            This invitation expires in 7 days. If you didn't expect this, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

---

## Phase 6 — Invitation Accept Route

Create `app/invite/accept/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { acceptInvitation } from '@/server/collaboration'
import { requireUser } from '@/lib/get-session'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) redirect('/dashboard')

  // Ensure user is authenticated before accepting
  // requireUser() will throw/redirect to login if not authenticated
  // The middleware does NOT cover /invite routes — handle auth manually here
  try {
    await requireUser()
  } catch {
    // Not authenticated — redirect to login with callback
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/accept?token=${token}`)}`)
  }

  const result = await acceptInvitation(token)

  if (result.success) {
    redirect(`/trees/${result.data!.treeId}`)
  }

  // Show error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
        <p className="text-stone-800 font-medium mb-2">Invitation error</p>
        <p className="text-stone-500 text-sm">{result.error}</p>
        <a href="/dashboard" className="mt-6 inline-block text-sm text-stone-400 hover:text-stone-600">
          Go to dashboard
        </a>
      </div>
    </div>
  )
}
```

**Important:** Add `/invite` to the middleware matcher exclusion list so unauthenticated users reach the page (they'll be redirected to login from within the page itself):

In `middleware.ts`, the matcher is:
```typescript
export const config = {
  matcher: ['/dashboard/:path*', '/trees/:path*'],
  // /invite/accept is intentionally NOT in the matcher
}
```

---

## Phase 7 — Dashboard Changes

### 7.1 Updated `getUserTrees` in `server/trees.ts`

Replace the current implementation with one that also fetches shared trees:

```typescript
import { treeMembers } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'

export async function getUserTrees() {
  const user = await requireUser()

  // Own trees
  const ownTrees = await db.query.trees.findMany({
    where: eq(trees.userId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })

  // Trees shared with the user (accepted memberships)
  const memberships = await db.query.treeMembers.findMany({
    where: and(
      eq(treeMembers.userId, user.id),
      eq(treeMembers.status, 'accepted')
    ),
  })

  const sharedTrees = memberships.length > 0
    ? await db.query.trees.findMany({
        where: inArray(trees.id, memberships.map((m) => m.treeId)),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      })
    : []

  return [
    ...ownTrees.map((t) => ({ ...t, isShared: false })),
    ...sharedTrees.map((t) => ({ ...t, isShared: true })),
  ]
}
```

### 7.2 Dashboard UI

In the tree card component, conditionally render a "Shared" badge when `isShared === true`:

```tsx
{tree.isShared && (
  <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 border border-stone-200 rounded-full px-2 py-0.5">
    Shared
  </span>
)}
```

---

## Phase 8 — Collaborators UI in Tree Settings

The tree settings page (`app/(app)/trees/[treeId]/settings/page.tsx`) needs a "Collaborators" section.

### Data fetching (server component):

```tsx
import { getTreeMembers } from '@/server/collaboration'
import { CollaboratorsPanel } from '@/components/tree/CollaboratorsPanel'

// Inside the settings page:
const members = await getTreeMembers(treeId)

// Render:
<CollaboratorsPanel treeId={treeId} members={members} slotCount={members.length} />
```

### `components/tree/CollaboratorsPanel.tsx` (client component):

This component must:

1. Display the current member list with:
   - Name/email
   - Status badge (`Pending` / `Active`)
   - "Revoke" button (calls `removeMember(member.id)`)

2. Display an "Invite collaborator" form with:
   - Email input
   - Submit button (calls `inviteCollaborator(treeId, { email })`)
   - Disabled when `slotCount >= 3`
   - Show remaining slots: "2 of 3 slots used"

3. Show expiry date for pending invitations

Pending invitations that are past `expiresAt` should be cleaned up lazily: in `getTreeMembers`, filter out expired pending invitations and update their status to `'revoked'` in the same query call (or add a cleanup step at the start of `getTreeMembers`):

```typescript
// At the start of getTreeMembers, expire stale invitations
await db.update(treeMembers)
  .set({ status: 'revoked' })
  .where(
    and(
      eq(treeMembers.treeId, treeId),
      eq(treeMembers.status, 'pending'),
      lt(treeMembers.expiresAt, new Date())
    )
  )
```

---

## Phase 9 — Account Deletion Guard

Locate the account deletion flow (likely in settings or profile page). Before executing deletion, check:

```typescript
import { getActiveSlotCount } from '@/lib/tree-access'
import { db } from '@/lib/db'
import { trees } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function canDeleteAccount(userId: string): Promise<{ canDelete: boolean; reason?: string }> {
  const userTrees = await db.query.trees.findMany({
    where: eq(trees.userId, userId),
    columns: { id: true },
  })

  for (const tree of userTrees) {
    const slots = await getActiveSlotCount(tree.id)
    if (slots > 0) {
      return {
        canDelete: false,
        reason: 'You have trees with active collaborators. Remove all collaborators or delete the trees before deleting your account.',
      }
    }
  }

  return { canDelete: true }
}
```

Surface this check in the UI before confirming account deletion. Do not silently block — show the reason.

---

## Implementation Order

| # | Status | Phase | Task |
|---|---|---|---|
| 1 | [ ] | 1 | Schema: add `memberStatusEnum`, `tree_members` table, `createdBy` on `persons`/`unions`/`parentage` → `pnpm db:push` |
| 2 | [ ] | 2 | Create `lib/tree-access.ts` with `requireTreeAccess`, `requireTreeAdmin`, `getActiveSlotCount` |
| 3 | [ ] | 3 | Refactor `server/persons.ts` and `server/relationships.ts`: swap ownership checks for `requireTreeAccess`, pass `createdBy` on inserts |
| 4 | [ ] | 3 | Refactor `server/trees.ts`: update `getTree` and `updateTree` to use `requireTreeAccess` |
| 5 | [ ] | 5 | Install Resend (`pnpm add resend react-email @react-email/components`), create `lib/email.ts` and `emails/invitation.tsx` |
| 6 | [ ] | 4 | Create `server/collaboration.ts`: `inviteCollaborator`, `acceptInvitation`, `removeMember`, `getTreeMembers` |
| 7 | [ ] | 6 | Create `app/invite/accept/page.tsx` — public accept route with auth redirect |
| 8 | [ ] | 7 | Update `getUserTrees` to union own + shared trees; add `isShared` badge to dashboard card |
| 9 | [ ] | 8 | Build `CollaboratorsPanel` component; wire into tree settings page |
| 10 | [ ] | 9 | Add `canDeleteAccount` guard; surface in account deletion UI |

**Status values:** `[ ]` not started · `[~]` in progress · `[x]` completed · `[!]` blocked

---

## Key Constraints

| Constraint | Detail |
|---|---|
| `pnpm` only | Never use `npm` or `yarn` |
| Better Auth only | Never use `devSession` from `@/lib/dev-session` |
| Auth in Server Components | Use `requireUser()` from `@/lib/get-session` |
| Auth in Client Components | Use `authClient` from `@/lib/auth-client` |
| Next.js 16 has breaking changes | Read `node_modules/next/dist/docs/` before writing any route or middleware code |
| All server actions return `Result<T>` | Never throw errors to the client — catch and return `{ success: false, error: string }` |
| Slot limit is enforced server-side only | Do not rely on client-side checks |
| `inviteToken` = `crypto.randomUUID()` | Native, no external library needed |
| `expiresAt` comparison uses `new Date()` | Timestamps in the DB use `timestamp` type (not text), so JS `Date` comparisons work directly with Drizzle |
