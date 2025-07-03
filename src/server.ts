import type { Server } from "http"
import mongoose from "mongoose"
import app from "./app"
import config from "./app/config"
import { initializeSocket } from "./app/socket"

let server: Server

async function main() {
  try {
    // Configure mongoose settings before connecting
    mongoose.set("strictQuery", false)

    const mongooseOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    }

    await mongoose.connect(config.database_url as string, mongooseOptions)
    console.log("Database connected successfully")

    server = app.listen(config.port || 5000, () => {
      console.log(`App is listening on port ${config.port || 5000}`)

      // Initialize Socket.io after server starts
      const io = initializeSocket(server)
      console.log("Socket.io initialized successfully")
    })
  } catch (err) {
    console.log("Database connection error:", err)
    process.exit(1)
  }
}

// Only start the server if not in Vercel environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  main()
}

// Handle process termination gracefully
process.on("unhandledRejection", (reason) => {
  console.log("unhandledRejection is detected:", reason)
  if (server) {
    server.close(() => {
      mongoose.disconnect().then(() => {
        process.exit(1)
      })
    })
  } else {
    mongoose.disconnect().then(() => {
      process.exit(1)
    })
  }
})

process.on("uncaughtException", (error) => {
  console.log("uncaughtException is detected:", error)
  mongoose.disconnect().then(() => {
    process.exit(1)
  })
})

// For Vercel serverless functions
if (process.env.VERCEL) {
  mongoose.set("strictQuery", false)

  // Connect with better error handling for serverless
  mongoose
    .connect(config.database_url as string, {
      maxPoolSize: 5, // Smaller pool for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    })
    .catch((error) => {
      console.error("Serverless database connection error:", error)
    })
}

// Export the Express app for Vercel
export default app
