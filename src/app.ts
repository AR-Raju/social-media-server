import cors from "cors";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import config from "./app/config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";

const app: Application = express();

// Database connection for serverless with better error handling
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

const connectDB = async (): Promise<void> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // If there's already a connection attempt in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      if (!config.database_url) {
        throw new Error("DATABASE_URL is not defined");
      }

      // Close existing connection if it's in a bad state
      if (
        mongoose.connection.readyState === 2 ||
        mongoose.connection.readyState === 3
      ) {
        await mongoose.disconnect();
      }

      // Configure mongoose with better settings
      mongoose.set("strictQuery", false);

      await mongoose.connect(config.database_url, {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      });

      isConnected = true;
      console.log("Database connected successfully");
    } catch (error) {
      isConnected = false;
      console.error("Database connection error:", error);
      throw error;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
  isConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
  isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
  isConnected = false;
});

// Middleware to ensure database connection with timeout
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Set a timeout for the connection attempt
    const connectionTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timeout")), 8000);
    });

    await Promise.race([connectDB(), connectionTimeout]);
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error:
        process.env.NODE_ENV === "development"
          ? error
          : "Internal server error",
    });
  }
});

// CORS configuration - MUST be before other middleware
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    console.log("CORS Origin:", origin); // Debug log

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // List of allowed origins
    const allowedOrigins = [
      "https://sports-facility-client-sand.vercel.app",
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3000",
      "https://localhost:3001",
    ].filter((url): url is string => typeof url === "string" && url.length > 0);

    // Allow any Vercel deployment URLs
    const isVercelUrl = origin.includes(".vercel.app");
    const isNetlifyUrl = origin.includes(".netlify.app");
    const isAllowedOrigin = allowedOrigins.includes(origin);

    if (isAllowedOrigin || isVercelUrl || isNetlifyUrl) {
      console.log("CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "X-HTTP-Method-Override",
  ],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

// Apply CORS first
app.use(cors(corsOptions));

// Security middleware - adjusted for serverless
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Disable CSP for API
  })
);

// Rate limiting - adjusted for serverless
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting only in production
if (process.env.NODE_ENV === "production") {
  app.use(limiter);
}

// Parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Green Haven Nursery Platform API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Basic health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Green Haven Nursery Platform API is running!",
    timestamp: new Date().toISOString(),
    database: isConnected ? "connected" : "disconnected",
  });
});

// Application routes
app.use("/api", router);

// Global error handler
app.use(globalErrorHandler);

// 404 handler
app.use(notFound);

export default app;
