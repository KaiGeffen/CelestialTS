import { sql, SQL } from 'drizzle-orm'
import {
  pgTable,
  uuid,
  integer,
  varchar,
  date,
  bit,
  uniqueIndex,
  AnyPgColumn,
} from 'drizzle-orm/pg-core'

export const players = pgTable(
  'players',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: uuid('uuid').notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    createdate: date().notNull().default('now()'),
    lastActive: date().notNull().default('now()'),
    lastActivity: varchar('lastactivity', { length: 255 })
      .notNull()
      .default(''),

    // Aesthetic
    username: varchar('username', { length: 255 }).notNull().default('unknown'),

    // Just for pvp
    wins: integer().notNull().default(0),
    losses: integer().notNull().default(0),
    elo: integer().notNull().default(1000),

    decks: varchar('decks', { length: 255 }).array().notNull().default([]),

    // TODO This doesn't get used anymore, remove
    userprogress: varchar('userprogress', { length: 255 })
      .array()
      .notNull()
      .default([]),

    // Single player
    // inventory: bit('inventory', { dimensions: 1000 })
    //   .notNull()
    //   .default('1000101001011100001'),
    // completedmissions: bit('completedmissions', { dimensions: 1000 })
    //   .notNull()
    //   .default(''),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex('emailUniqueIndex').on(lower(table.email)),
    // TODO Enforce unique usernames
    // usernameUnique: uniqueIndex('usernameUnique').on(lower(table.username)),
  }),
)

// Custom lower function
function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`
}
