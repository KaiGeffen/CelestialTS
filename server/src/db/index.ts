import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { players } from './schema'
import { db } from './db'

async function main() {
  const user: typeof players.$inferInsert = {
    id: '1',
    email: 'john@example.com',
  }

  await db.insert(players).values(user)
  console.log('New user created!')

  const users = await db.select().from(players)
  console.log('Getting all users from the database: ', users)

  await db
    .update(players)
    .set({
      age: 31,
    })
    .where(eq(players.email, user.email))
  console.log('User info updated!')

  await db.delete(players).where(eq(players.email, user.email))
  console.log('User deleted!')
}

main()
