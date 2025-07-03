import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  cors_origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
  image_bb_api_key: process.env.IMAGE_BB_API_KEY,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
  facebook_app_id: process.env.FACEBOOK_APP_ID,
  facebook_app_secret: process.env.FACEBOOK_APP_SECRET,
  session_secret: process.env.SESSION_SECRET || "social-media-secret",
  client_url: process.env.CLIENT_URL || "http://localhost:3000",
}
