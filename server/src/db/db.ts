import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import type { players } from './schema'
import * as dotenv from 'dotenv'

dotenv.config()

// Define schema type if needed
type Schema = {
  players: typeof players
}

const pool = new Pool({
  user: 'kai',
  host: 'localhost',
  database: 'celestial_test',
  port: 5432,
})

export const db = drizzle<Schema>(pool, { schema })
