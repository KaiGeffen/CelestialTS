import { WebSocketServer } from 'ws'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import superjson from 'superjson'
import { initTRPC } from '@trpc/server'
import { z } from 'zod'
// import {URL, PORT} from '../../shared/settings'
const URL = '23232'
const PORT = 132

const t = initTRPC.create({
  transformer: superjson,
})

const matchRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name ?? 'world'}` }
    }),
})

export type MatchRouter = typeof matchRouter




const wss = new WebSocketServer({ port: PORT })

const handler = applyWSSHandler({
  wss,
  router: matchRouter,
  createContext: () => ({}),
  // transformer: superjson,
})

wss.on('connection', (ws) => {
  console.log('Client connected')
  
  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

console.log(`WebSocket server is running on ws://${URL}:${PORT}`)


// import * as WebSocket from 'ws';

// // Define the port and address to listen on
// const PORT = 5555;
// const ADDRESS = 'localhost'; // or '0.0.0.0' for all interfaces

// // Create a WebSocket server instance
// const server = new WebSocket.Server({ port: PORT, host: ADDRESS });

// // Handle connections
// server.on('connection', (ws: WebSocket) => {
//     console.log('Client connected');

//     ws.send(JSON.stringify({ type: 'both_players_connected' }));

//     // Handle messages from clients
//     ws.on('message', (message: string) => {
//         console.log(`Received message: ${message}`);
//         // Example: Echo the message back to the client
//         ws.send(`Echo: ${message}`);
//     });

//     // Handle closing of connection
//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });
// });

// // Handle server errors
// server.on('error', (err) => {
//     console.error('WebSocket server error:', err);
// });

// console.log(`WebSocket server started on ws://${ADDRESS}:${PORT}`);
