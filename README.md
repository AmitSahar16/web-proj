# Fullstack Project API

A RESTful API built with Node.js, Express, TypeScript, MongoDB, and JWT authentication. This API provides CRUD operations for Users, Posts, and Comments with authentication and authorization.

## Features

- ✅ **JWT Authentication** with access and refresh tokens
- ✅ **User Management** - Full CRUD operations
- ✅ **Post Management** - Create, read, update, delete posts with ownership enforcement
- ✅ **Comment Management** - Create, read, update, delete comments with ownership enforcement
- ✅ **TypeScript** - Fully typed codebase
- ✅ **Swagger Documentation** - Interactive API documentation
- ✅ **Unit & Integration Tests** - Comprehensive test coverage with Jest
- ✅ **Password Hashing** - Secure password storage with bcrypt

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=4000
DATABASE_URL=mongodb://localhost:27017/fullstack-proj
ACCESS_TOKEN_SECRET=your-access-token-secret-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

4. Build the TypeScript code:
```bash
npm run build
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:4000` (or the port specified in `.env`)

## API Documentation

Once the server is running, access the Swagger UI at:
```
http://localhost:4000/api-docs
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token

### Users (Requires Authentication)
- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Posts (Requires Authentication)
- `POST /post` - Create a new post
- `GET /post` - Get all posts (optional: `?user=userId` to filter)
- `GET /post/:id` - Get post by ID
- `PUT /post/:id` - Update post (owner only)
- `DELETE /post/:id` - Delete post (owner only)

### Comments (Requires Authentication)
- `POST /comment` - Create a new comment
- `GET /comment` - Get all comments (optional: `?post=postId` to filter)
- `GET /comment/:id` - Get comment by ID
- `PUT /comment/:id` - Update comment (owner only)
- `DELETE /comment/:id` - Delete comment (owner only)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Example: Register and Login

```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── __tests__/          # Test files
├── controllers/        # Route controllers
├── middleware/         # Express middleware (auth, ownership)
├── models/             # Mongoose models
├── routes/             # Express routes
├── services/           # Business logic services
├── types/              # TypeScript type definitions
├── mongoose/           # MongoDB connection
└── app.ts              # Application entry point
```

## Database Schema

### User
- `_id`: ObjectId
- `username`: String (unique, required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `createdAt`: Date
- `updatedAt`: Date

### Post
- `_id`: ObjectId
- `message`: String (required)
- `user`: ObjectId (reference to User, required)
- `createdAt`: Date
- `updatedAt`: Date

### Comment
- `_id`: ObjectId
- `post`: ObjectId (reference to Post, required)
- `text`: String (required)
- `user`: ObjectId (reference to User, required)
- `createdAt`: Date
- `updatedAt`: Date

## Security Features

- Passwords are hashed using bcrypt before storage
- JWT tokens for stateless authentication
- Refresh tokens for secure token rotation
- Ownership enforcement for posts and comments
- Input validation and sanitization

## Development Notes

- The project uses TypeScript for type safety
- All routes are protected by authentication middleware
- Ownership checks ensure users can only modify their own posts/comments
- Refresh tokens are stored in-memory (consider Redis for production)
- Swagger documentation is auto-generated from route annotations

## Git Collaboration

The project is structured to support feature branch development:
- Each module (auth, users, posts, comments) is in separate files
- Controllers, services, and routes are separated for maintainability
- Tests are organized by module for easy parallel development

## License

ISC

