# SocialConnect Platform API - Postman Collection Setup

This document provides instructions for setting up and using the Postman collection for the SocialConnect Platform API.

## 📥 Import Collection

1. **Download the Collection**: Save the `postman-collection.json` file to your computer
2. **Open Postman**: Launch the Postman application
3. **Import**: Click "Import" button → "Upload Files" → Select `postman-collection.json`
4. **Verify**: The collection should appear in your Postman workspace

## 🔧 Environment Setup

### Collection Variables

The collection includes these pre-configured variables:

- `baseUrl`: API base URL (default: `http://localhost:5000/api`)
- `accessToken`: JWT token for authentication (auto-populated after login)
- `userId`: Current user ID (auto-populated after login)
- `postId`: Sample post ID (auto-populated when creating posts)
- `eventId`: Sample event ID (auto-populated when creating events)
- `listingId`: Sample listing ID (auto-populated when creating listings)
- `groupId`: Sample group ID (auto-populated when creating groups)

### Update Base URL

If your API runs on a different URL:

1. Go to the collection settings (click the three dots next to collection name)
2. Select "Edit"
3. Go to "Variables" tab
4. Update the `baseUrl` value

## 🚀 Getting Started

### 1. Authentication Flow

\`\`\`

1. Register User → Creates new account
2. Login User → Returns access token (auto-saved to collection variables)
3. Use authenticated endpoints → Token automatically added to requests
   \`\`\`

### 2. Basic Workflow

\`\`\`
Authentication → Create Content → Interact → Manage
\`\`\`

## 📋 API Endpoints Overview

### 🔐 Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user (saves token automatically)
- `GET /auth/me` - Get current user profile
- `POST /auth/change-password` - Change password
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user

### 👥 Users

- `PATCH /users/me` - Update profile
- `GET /users/{id}` - Get user profile
- `GET /users/search` - Search users
- `GET /users/{id}/friends` - Get user friends
- `POST /users/block/{id}` - Block user
- `POST /users/unblock/{id}` - Unblock user

### 📝 Posts

- `POST /posts` - Create post
- `GET /posts` - Get feed posts
- `GET /posts/{id}` - Get single post
- `PATCH /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post
- `POST /posts/{id}/react` - React to post
- `POST /posts/{id}/comment` - Add comment
- `POST /posts/{id}/share` - Share post

### 🎉 Events

- `POST /events` - Create event
- `GET /events` - Get all events
- `GET /events/{id}` - Get single event
- `PATCH /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event
- `POST /events/{id}/join` - Join event
- `POST /events/{id}/leave` - Leave event
- `GET /events/{id}/attendees` - Get attendees
- `GET /events/my` - Get my events

### 🛒 Trading

- `POST /trading/listings` - Create listing
- `GET /trading/listings` - Get all listings
- `GET /trading/listings/{id}` - Get single listing
- `PATCH /trading/listings/{id}` - Update listing
- `DELETE /trading/listings/{id}` - Delete listing
- `POST /trading/listings/{id}/contact` - Contact seller
- `POST /trading/listings/{id}/sold` - Mark as sold
- `POST /trading/listings/{id}/like` - Toggle like

### 💾 Saved Items

- `POST /saved/{type}/{id}` - Save item (posts/events/listings)
- `DELETE /saved/{type}/{id}` - Unsave item
- `GET /saved` - Get all saved items
- `GET /saved/posts` - Get saved posts
- `GET /saved/events` - Get saved events
- `GET /saved/listings` - Get saved listings
- `GET /saved/{type}/{id}/status` - Check save status

### 👫 Friends

- `POST /friends/request/{id}` - Send friend request
- `POST /friends/accept/{requestId}` - Accept request
- `POST /friends/reject/{requestId}` - Reject request
- `GET /friends/requests` - Get friend requests
- `GET /friends/list` - Get friends list
- `GET /friends/suggestions` - Get suggestions

### 👥 Groups

- `POST /groups/create` - Create group
- `GET /groups` - Get all groups
- `GET /groups/{id}` - Get single group
- `POST /groups/{id}/join` - Join group
- `POST /groups/{id}/leave` - Leave group
- `GET /groups/{id}/posts` - Get group posts

### 💬 Messages

- `POST /messages/send/{userId}` - Send message
- `GET /messages/conversations` - Get conversations
- `GET /messages/{userId}` - Get messages with user

### 🔔 Notifications

- `GET /notifications` - Get notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/mark-read` - Mark as read
- `DELETE /notifications/{id}` - Delete notification

## 🔍 Testing Features

### Auto-Token Management

- Login automatically saves the access token
- All authenticated requests use the saved token
- No need to manually copy/paste tokens

### Auto-ID Extraction

- Creating posts/events/listings automatically saves their IDs
- Use these IDs in subsequent requests
- Reduces manual ID copying

### Global Tests

Every request includes automatic tests for:

- JSON response format
- Success field presence
- Message field presence

## 📊 Query Parameters

### Pagination

\`\`\`
?page=1&limit=10
\`\`\`

### Search

\`\`\`
?searchTerm=keyword
\`\`\`

### Filtering

\`\`\`
?category=technology&status=active
\`\`\`

### Sorting

\`\`\`
?sortBy=createdAt&sortOrder=desc
\`\`\`

## 🔧 Common Use Cases

### 1. Complete User Journey

\`\`\`

1. Register → Login → Update Profile
2. Create Post → React → Comment
3. Create Event → Join Event
4. Create Listing → Contact Seller
5. Save Items → View Saved
   \`\`\`

### 2. Social Interactions

\`\`\`

1. Search Users → Send Friend Request
2. Accept Friend Request → View Friends
3. Create Group → Join Group
4. Send Messages → View Conversations
   \`\`\`

### 3. Content Management

\`\`\`

1. Create Content (Post/Event/Listing)
2. Update Content
3. Interact (Like/Comment/Join)
4. Save for Later
5. Delete if Needed
   \`\`\`

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Ensure you're logged in
   - Check if token is saved in collection variables
   - Try refreshing the token

2. **404 Not Found**
   - Verify the endpoint URL
   - Check if required IDs are set in variables
   - Ensure the resource exists

3. **400 Bad Request**
   - Check request body format
   - Verify required fields are included
   - Validate data types and constraints

4. **500 Internal Server Error**
   - Check server logs
   - Verify database connection
   - Ensure all environment variables are set

### Debug Tips

1. **Check Collection Variables**
   - View current variable values
   - Ensure tokens and IDs are populated

2. **Review Request Headers**
   - Verify Authorization header is present
   - Check Content-Type for POST/PATCH requests

3. **Validate Request Body**
   - Ensure JSON is properly formatted
   - Check required vs optional fields

## 📝 Notes

- All timestamps are in ISO 8601 format
- File uploads use multipart/form-data
- Authentication tokens expire after 7 days
- Rate limiting: 100 requests per 15 minutes in production
- All responses follow the standard format: `{success, message, data, pagination?}`

## 🔄 Updates

When the API is updated:

1. Re-import the updated collection
2. Check for new endpoints or changed parameters
3. Update any custom scripts or tests
4. Verify authentication still works

---

Happy testing! 🚀
