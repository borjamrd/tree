import {
  pgTable, uuid, text, boolean, date, timestamp,
  pgEnum, index, unique, integer, uniqueIndex
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { relations } from 'drizzle-orm'

// ─── Enums ───────────────────────────────────────────────────────────────────

export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'unknown'])
export const unionTypeEnum = pgEnum('union_type', ['married', 'partnered', 'divorced', 'separated', 'unknown'])
export const parentageTypeEnum = pgEnum('parentage_type', ['biological', 'adoptive', 'step', 'foster', 'unknown'])

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (t) => [unique().on(t.provider, t.providerAccountId)])

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (t) => [unique().on(t.identifier, t.token)])

// ─── Trees ───────────────────────────────────────────────────────────────────

export const trees = pgTable('trees', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  lastName2: text('last_name_2'),
  gender: genderEnum('gender').default('unknown').notNull(),
  birthDate: date('birth_date'),
  birthPlace: text('birth_place'),
  deathDate: date('death_date'),
  deathPlace: text('death_place'),
  isAlive: boolean('is_alive').default(true).notNull(),
  isSelf: boolean('is_self').default(false).notNull(),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  posX: text('pos_x').default('0'),
  posY: text('pos_y').default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('persons_tree_idx').on(t.treeId),
  uniqueIndex('persons_one_self_per_tree').on(t.treeId).where(sql`${t.isSelf} = true`),
])

// ─── Unions ──────────────────────────────────────────────────────────────────

export const unions = pgTable('unions', {
  id: uuid('id').primaryKey().defaultRandom(),
  treeId: uuid('tree_id').notNull().references(() => trees.id, { onDelete: 'cascade' }),
  person1Id: uuid('person1_id').notNull().references(() => persons.id, { onDelete: 'cascade' }),
  person2Id: uuid('person2_id').references(() => persons.id, { onDelete: 'set null' }),
  type: unionTypeEnum('type').default('unknown').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  notes: text('notes'),
  posX: text('pos_x').default('0'),
  posY: text('pos_y').default('0'),
}, (t) => [index('unions_tree_idx').on(t.treeId)])

// ─── Parentage ───────────────────────────────────────────────────────────────

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

// ─── Relations ───────────────────────────────────────────────────────────────

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
