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

/*

                                       Table "public.players"
      Column       |        Type         | Collation | Nullable |              Default               
-------------------+---------------------+-----------+----------+------------------------------------
 id                | uuid                |           |          | 
 email             | character varying   |           |          | 

//  Liveness
createdate        | date                |           |          | now()
lastactive        | date                |           |          | now()
lastaction        | string              |           |          | ''

// PVP Records
 wins              | integer             |           |          | 0
 losses            | integer             |           |          | 0
 ties              | integer             |           |          | 0
 elo               | integer             |           |          | 1000

 // Decks
 decks             | character varying[] |           |          | '{}'::character varying[]

 // Single player
 inventory         | bit varying(1000)   |           |          | '1000101001011100001'::bit varying
 completedmissions | bit varying(1000)   |           |          | ''::bit varying

 // Owned assets
 // TODO Complicated, use a HATS table, and a join USER_HATS table 

 REMOVE userprogress      | character varying[] |           |          | '{}'::character varying[]
*/

export const players = pgTable(
  'players',
  {
    id: uuid('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    createdate: date('createdate').notNull().default('now()'),
    lastActive: date('lastactive').notNull().default('now()'),
    // TODO Rename to clarify this is the last action user took
    lastActivity: varchar('lastactivity', { length: 255 })
      .notNull()
      .default(''),

    // Aesthetic
    username: varchar('username', { length: 255 })
      .notNull()
      .default('lllllllll'),

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
