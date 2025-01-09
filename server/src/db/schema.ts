import { pgTable, uuid, integer, varchar, date, bit } from 'drizzle-orm/pg-core'

export const players = pgTable('players', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  createdate: date('createdate').notNull().default('now()'),
  lastActive: date('lastactive').notNull().default('now()'),
  lastActivity: varchar('lastactivity', { length: 255 }).notNull().default(''),

  // Just for pvp
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  elo: integer('elo').notNull().default(1000),

  decks: varchar('decks', { length: 255 }).array().notNull().default([]),

  // TODO This doesn't get used anymore, remove
  userprogress: varchar('userprogress', { length: 255 })
    .array()
    .notNull()
    .default([]),

  // Single player
  inventory: bit('inventory', { dimensions: 1000 })
    .notNull()
    .default('1000101001011100001'),
  completedmissions: bit('completedmissions', { dimensions: 1000 })
    .notNull()
    .default(''),
})
