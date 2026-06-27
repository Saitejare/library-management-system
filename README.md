# Library Management System

A backend API for library management built with Node.js, Express, and MongoDB Atlas.

## Project Setup

This project includes:

- JWT authentication with `member` and `librarian` roles
- Book CRUD with search, filtering, pagination, and sorting
- Member profile and management APIs
- Borrow and return workflows with fine calculation
- Security middleware: Helmet, rate limiting, compression, and CORS

## Installation Steps

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root.
4. Start the development server:

```bash
npm run dev
```

## Environment Variables

Add the following to `.env`:

```dotenv
MONGO_URI=your_mongo_atlas_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

Do not commit the `.env` file or secret values to source control.

## Database Setup

1. Create a MongoDB Atlas cluster.
2. Create a database named `library_management_db`.
3. Create a MongoDB user with read/write access.
4. Set `MONGO_URI` in `.env` with your Atlas connection string.

Example:

```dotenv
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/library_management_db?retryWrites=true&w=majority
```

## API Documentation

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### Books

- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`

### Members

- `GET /api/members/me`
- `PUT /api/members/me`
- `GET /api/members`
- `GET /api/members/:id`
- `DELETE /api/members/:id`

### Borrow / Return

- `POST /api/books/:bookId/borrow`
- `POST /api/books/:bookId/return`
- `GET /api/members/me/books`
- `GET /api/members/me/history`
- `GET /api/borrows`
- `GET /api/borrows/:id`

## How to Run the Project

Start the application in development mode:

```bash
npm run dev
```

Start the application in production mode:

```bash
npm start
```

Server should run on the configured `PORT` and expose the API at `http://localhost:<PORT>`.

## Notes

- CORS is configured for `http://localhost:3000`.
- Requests are rate limited to 100 per 15 minutes.
- User passwords are never returned in API responses.
