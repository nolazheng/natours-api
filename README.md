# Natours API - A Modern Tour Booking REST API with TypeScript and Express

Natours API is a robust tour booking platform built with TypeScript and Express.js that enables users to discover, review, and book tours. The API provides comprehensive tour management features with secure authentication, advanced filtering, and geospatial capabilities.

This application implements industry-standard security practices, including rate limiting, data sanitization, and XSS protection. It offers a complete tour management system with user authentication, authorization, and review functionality. The API supports advanced querying features like filtering, sorting, and pagination, making it ideal for building scalable tour booking platforms.

## Postman API document

https://documenter.getpostman.com/view/9957684/2sAYkKGwgo

## Repository Structure

```
.
├── app.ts                 # Application entry point with Express configuration and middleware setup
├── controllers/          # Request handlers and business logic implementation
│   ├── auth.ts          # Authentication and authorization controllers
│   ├── tour.ts          # Tour management controllers
│   ├── user.ts          # User management controllers
│   └── review.ts        # Review management controllers
├── models/              # Mongoose data models and schemas
│   ├── tour.ts         # Tour model with geospatial features
│   ├── user.ts         # User model with authentication methods
│   └── review.ts       # Review model with rating calculations
├── routes/             # API route definitions
│   ├── tour.ts        # Tour routes with nested review handling
│   ├── user.ts        # User authentication and management routes
│   └── review.ts      # Review routes with authorization
├── utils/             # Utility functions and helpers
│   ├── email.ts      # Email sending functionality
│   └── query-builder.ts # Advanced query building utilities
└── factory/          # Generic CRUD operation handlers
    └── handler.ts    # Reusable database operation handlers
```

## Usage Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Bun runtime environment
- TypeScript (^5.0.0)

Required environment variables:

```
DATABASE=<mongodb_connection_string>
DATABASE_PASSWORD=<database_password>
JWT_SECRET=<jwt_secret_key>
JWT_EXPIRES_IN=<jwt_expiration_time>
JWT_COOKIE_EXPIRES_IN=<cookie_expiration_time>
```

### Installation

```bash
# Clone the repository
git clone <repository_url>
cd natours-api

# Install dependencies
bun install

# Development mode
bun dev

# Production mode
bun prod

# Debug mode
bun debug
```

### Quick Start

1. Create a new user:

```typescript
fetch('api/v1/users/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'test1234',
    passwordConfirm: 'test1234',
  }),
});
```

2. Login to get JWT token:

```typescript
fetch('api/v1/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test1234',
  }),
});
```

### More Detailed Examples

1. Create a new tour (requires admin/lead-guide role):

```typescript
fetch('api/v1/tours', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer <your_jwt_token>',
  },
  body: JSON.stringify({
    name: 'Test Tour',
    duration: 5,
    maxGroupSize: 25,
    difficulty: 'easy',
    price: 397,
    summary: 'Test tour description',
  }),
});
```

2. Get tours with filtering:

```typescript
// Get tours with price less than 500
fetch('api/v1/tours?price[lt]=500');

// Get tours sorted by price
fetch('api/v1/tours?sort=price');

// Get tours with pagination
fetch('api/v1/tours?page=1&limit=10');
```

### Troubleshooting

Common Issues:

1. Authentication Errors

```
Error: You are not logged in! Please log in to get access.
Solution: Ensure you're including the JWT token in the Authorization header
Debug: Enable morgan logging in development mode
```

2. Database Connection Issues

```
Error: DB connection failed
Solution:
- Check MongoDB connection string
- Verify database credentials
- Ensure MongoDB service is running
```

3. Rate Limiting

```
Error: Too many requests from this IP, please try again later
Solution: Default limit is 100 requests per hour per IP
Debug: Adjust rate limiting in app.ts:
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000
})
```

## Data Flow

The application follows a RESTful architecture with MongoDB as the database. Requests flow through middleware for security and validation before reaching the appropriate controller.

```ascii
Client Request → Express App → Middleware Stack → Router → Controller → Model → MongoDB
     ↑                                                                              ↓
     └──────────────────────── JSON Response ────────────────────────────────────────
```

Key component interactions:

1. All requests pass through security middleware (helmet, rate limiting, sanitization)
2. Authentication middleware validates JWT tokens for protected routes
3. Routes direct requests to appropriate controllers
4. Controllers use factory handlers for CRUD operations
5. Models implement business logic and database schema validation
6. Query builder enables advanced filtering and pagination
7. Error handling middleware catches and formats all errors
8. Response compression middleware optimizes payload size
