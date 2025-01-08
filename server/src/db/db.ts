import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  user: 'your-db-user',
  host: 'your-db-host',
  database: 'your-db-name',
  password: 'your-db-password',
  port: 5432,
})

export const db = drizzle(pool, { schema })
