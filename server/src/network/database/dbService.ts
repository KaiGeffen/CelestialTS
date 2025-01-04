import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Register a new account
export async function registerAccount(username: string, password: string) {
  return await prisma.account.create({
    data: { username, password },
  })
}

// Update stored decks
export async function updateDecks(accountId: number, decks: string[]) {
  return await prisma.account.update({
    where: { id: accountId },
    data: { decks: JSON.stringify(decks) },
  })
}

// Update wins, losses, or ELO
export async function updateStats(
  accountId: number,
  wins: number,
  losses: number,
  elo: number,
) {
  return await prisma.account.update({
    where: { id: accountId },
    data: { wins, losses, elo },
  })
}

// Get top players
export async function getTopPlayers(limit: number = 10) {
  return await prisma.account.findMany({
    orderBy: { elo: 'desc' },
    take: limit,
    select: {
      username: true,
      wins: true,
      losses: true,
      elo: true,
    },
  })
}
