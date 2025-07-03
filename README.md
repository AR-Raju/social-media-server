# Social Media API Documentation

## Overview

This is a comprehensive REST API for a social media platform built with Node.js, Express, and MongoDB. The API supports user authentication, posts, comments, friends, messaging, groups, and notifications.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-production-api.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

## Response Format

All API responses follow this format:
\`\`\`json
{
"success": true,
"message": "Success message",
"data": {}, // Response data
"pagination": { // Only for paginated responses
"page": 1,
"limit": 10,
"total": 100,
"pages": 10
}
}
\`\`\`

## Error Handling

Error responses follow this format:
\`\`\`json
{
"success": false,
"message": "Error message",
"error": "Detailed error information"
}
\`\`\`

## Rate Limiting

- **General**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Upload**: 10 requests per 15 minutes per user

## Endpoints Overview

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/change-password` - Change password
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/google` - Google OAuth
- `GET /auth/facebook` - Facebook OAuth

### Users

- `PATCH /users/me` - Update user profile
- `GET /users/:id` - Get user profile
- `GET /users/search` - Search users
- `GET /users/:id/friends` - Get user friends
- `GET /users/:id/groups` - Get user groups
- `POST /users/block/:id` - Block user
- `POST /users/unblock/:id` - Unblock user

### Posts

- `POST /posts` - Create a new post
- `GET /posts` - Get feed posts (paginated)
- `GET /posts/:id` - Get single post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/react` - React to post
- `POST /posts/:id/share` - Share post
- `GET /posts/user/:id` - Get user posts

### Comments

- `POST /comments/post/:id` - Add comment to post
- `GET /comments/post/:id` - Get post comments
- `GET /comments/:id` - Get single comment
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment
- `POST /comments/:id/react` - React to comment
- `GET /comments/:id/replies` - Get comment replies

### Friends

- `POST /friends/request/:id` - Send friend request
- `POST /friends/accept/:id` - Accept friend request
- `POST /friends/reject/:id` - Reject friend request
- `DELETE /friends/remove/:id` - Remove friend
- `GET /friends/list` - Get friends list
- `GET /friends/requests` - Get friend requests
- `GET /friends/requests/sent` - Get sent friend requests
- `GET /friends/suggestions` - Get friend suggestions

### Messages

- `POST /messages/send/:id` - Send message
- `GET /messages/conversations` - Get conversations
- `GET /messages/:id` - Get messages with user
- `PATCH /messages/:id/read` - Mark messages as read

### Groups

- `POST /groups/create` - Create group
- `GET /groups` - Get all groups
- `GET /groups/:id` - Get single group
- `PATCH /groups/:id` - Update group
- `POST /groups/:id/join` - Join group
- `POST /groups/:id/leave` - Leave group
- `GET /groups/:id/posts` - Get group posts
- `GET /groups/user` - Get user groups
- `GET /groups/suggestions` - Get group suggestions
- `DELETE /groups/:id` - Delete group

### Notifications

- `GET /notifications` - Get notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/mark-read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

### Upload

- `POST /upload` - Upload single image
- `POST /upload/multiple` - Upload multiple images

### Search

- `GET /search` - Global search (users, posts, groups)

## Query Parameters

### Pagination

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Sorting

- `sort` - Sort field with direction (e.g., `-createdAt`, `name`)

### Filtering

- `isRead` - Filter notifications by read status
- `type` - Filter by content type
- `category` - Filter groups by category
- `privacy` - Filter by privacy level

## File Upload

- **Supported formats**: JPG, JPEG, PNG, GIF, WebP
- **Max file size**: 5MB per file
- **Max files**: 10 files per request

## WebSocket Events

The API supports real-time features via Socket.IO:

### Client Events

- `join_room` - Join user room
- `send_message` - Send real-time message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server Events

- `new_message` - New message received
- `new_notification` - New notification
- `user_online` - User came online
- `user_offline` - User went offline
- `typing` - Someone is typing

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Testing with Postman

1. **Import Collection**: Import the `Social_Media_API_Complete.postman_collection.json` file
2. **Import Environment**: Import the environment file for your target environment
3. **Set Base URL**: Update the `baseUrl` variable in your environment
4. **Authentication**:
   - Run the "Register User" or "Login User" request first
   - The access token will be automatically saved to environment variables
   - All subsequent requests will use this token automatically

## Environment Variables

Make sure to set these environment variables in your server:

\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
\`\`\`

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start MongoDB
5. Run the server: `npm run dev`
6. Import Postman collection and environment
7. Start testing the API endpoints

## Support

For issues or questions, please refer to the API documentation or contact the development team.
