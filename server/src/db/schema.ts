import { sql, SQL } from 'drizzle-orm'
import {
  pgTable,
  uuid,
  integer,
  varchar,
  date,
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

// PVP Records
 wins              | integer             |           |          | 0
 losses            | integer             |           |          | 0
 elo               | integer             |           |          | 1000

 // Decks
 decks             | character varying[] |           |          | '{}'::character varying[]

 // Single player
 inventory         | bit varying(1000)   |           |          | '1000101001011100001'::bit varying
 completedmissions | bit varying(1000)   |           |          | ''::bit varying
*/

export const players = pgTable(
  'players',
  {
    id: uuid('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    createdate: date('createdate')
      .notNull()
      .default(sql`now()`),
    lastactive: date('lastactive').notNull(),
    wins: integer('wins').notNull(),
    losses: integer('losses').notNull(),
    elo: integer('elo').notNull(),
    decks: varchar('decks', { length: 255 }).array().notNull(),
    inventory: varchar('inventory', { length: 1000 }).notNull(),
    completedmissions: varchar('completedmissions', { length: 1000 }).notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('email_idx').on(table.email),
  }),
)

// Custom lower function
function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`
}
