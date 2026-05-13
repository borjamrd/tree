import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  pgEnum,
  index,
  unique,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "other",
  "unknown",
]);
export const unionTypeEnum = pgEnum("union_type", [
  "married",
  "partnered",
  "divorced",
  "separated",
  "unknown",
]);
export const parentageTypeEnum = pgEnum("parentage_type", [
  "biological",
  "adoptive",
  "step",
  "foster",
  "unknown",
]);

// ─── Users & Auth (Better Auth) ──────────────────────────────────────────────
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: text("email_verified"),
  image: text("image"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: text("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: text("access_token_expires_at"),
  refreshTokenExpiresAt: text("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// ─── Trees ───────────────────────────────────────────────────────────────────

export const trees = pgTable(
  "trees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("trees_user_idx").on(t.userId)],
);

// ─── Persons ─────────────────────────────────────────────────────────────────

export const persons = pgTable(
  "persons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    treeId: uuid("tree_id")
      .notNull()
      .references(() => trees.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    lastName2: text("last_name_2"),
    gender: genderEnum("gender").default("unknown").notNull(),
    birthDate: date("birth_date"),
    birthPlace: text("birth_place"),
    deathDate: date("death_date"),
    deathPlace: text("death_place"),
    isAlive: boolean("is_alive").default(true).notNull(),
    isSelf: boolean("is_self").default(false).notNull(),
    photoUrl: text("photo_url"),
    bio: text("bio"),
    posX: text("pos_x").default("0"),
    posY: text("pos_y").default("0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("persons_tree_idx").on(t.treeId),
    uniqueIndex("persons_one_self_per_tree")
      .on(t.treeId)
      .where(sql`${t.isSelf} = true`),
  ],
);

export const unions = pgTable(
  "unions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    treeId: uuid("tree_id")
      .notNull()
      .references(() => trees.id, { onDelete: "cascade" }),
    person1Id: uuid("person1_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    person2Id: uuid("person2_id").references(() => persons.id, {
      onDelete: "set null",
    }),
    type: unionTypeEnum("type").default("unknown").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    notes: text("notes"),
    posX: text("pos_x").default("0"),
    posY: text("pos_y").default("0"),
  },
  (t) => [index("unions_tree_idx").on(t.treeId)],
);

// ─── Parentage ───────────────────────────────────────────────────────────────

export const parentage = pgTable(
  "parentage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    unionId: uuid("union_id")
      .notNull()
      .references(() => unions.id, { onDelete: "cascade" }),
    type: parentageTypeEnum("type").default("biological").notNull(),
  },
  (t) => [
    index("parentage_child_idx").on(t.childId),
    index("parentage_union_idx").on(t.unionId),
    unique("unique_child_union").on(t.childId, t.unionId),
  ],
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const treesRelations = relations(trees, ({ many }) => ({
  persons: many(persons),
  unions: many(unions),
}));

export const personsRelations = relations(persons, ({ one, many }) => ({
  tree: one(trees, { fields: [persons.treeId], references: [trees.id] }),
  childOf: many(parentage),
  unions1: many(unions, { relationName: "person1" }),
  unions2: many(unions, { relationName: "person2" }),
}));

export const unionsRelations = relations(unions, ({ one, many }) => ({
  tree: one(trees, { fields: [unions.treeId], references: [trees.id] }),
  person1: one(persons, {
    fields: [unions.person1Id],
    references: [persons.id],
    relationName: "person1",
  }),
  person2: one(persons, {
    fields: [unions.person2Id],
    references: [persons.id],
    relationName: "person2",
  }),
  children: many(parentage),
}));

export const parentageRelations = relations(parentage, ({ one }) => ({
  child: one(persons, {
    fields: [parentage.childId],
    references: [persons.id],
  }),
  union: one(unions, { fields: [parentage.unionId], references: [unions.id] }),
}));
