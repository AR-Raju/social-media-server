import { Server } from "socket.io"
import type { Server as HTTPServer } from "http"
import config from "../config"
import { socketAuthMiddleware } from "./socket.middleware"
import { setupSocketHandlers } from "./socket.handlers"
import { socketManager } from "./socket.manager"

export const initializeSocket = (server: HTTPServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: config.cors_origin,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // Set up authentication middleware
  io.use(socketAuthMiddleware)

  // Initialize socket manager
  socketManager.setIO(io)

  // Set up event handlers
  setupSocketHandlers(io)

  console.log("Socket.IO server initialized")

  return io
}

export { socketManager }
export { SocketService } from "./socket.service"
export * from "./socket.events"
export * from "./socket.interface"
