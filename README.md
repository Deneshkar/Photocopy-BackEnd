# Photocopy Backend

Backend API for a photocopy shop system built with Node.js, Express, and MongoDB. It provides authentication, user management, product catalog management, order processing, print request handling, dashboard reporting, and local file uploads.

## Features

- JWT-based authentication with customer and admin roles
- Product CRUD with stock and availability tracking
- Order creation with stock reservation and rollback protection
- Print request uploads with status management
- Admin dashboard summary and low-stock reporting
- Basic API smoke tests with `node:test` and `supertest`

## Tech Stack

- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens
- Multer for file uploads
- Nodemon for local development

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env` and fill in your real values.

```bash
PORT=5000
MONGO_URL=your-mongodb-connection-string
JWT_SECRET=your-strong-secret
NODE_ENV=development
```

### 3. Start the server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API runs on `http://localhost:5000` by default.

## Available Scripts

- `npm run dev`: start the server with nodemon
- `npm start`: start the server with Node.js
- `npm test`: run the automated tests
- `npm run check`: run syntax validation, then tests

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Server port. Defaults to `5000`. |
| `MONGO_URL` | Yes | MongoDB connection string used by Mongoose. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWT tokens. |
| `NODE_ENV` | No | Runtime environment, usually `development` or `production`. |

## Project Structure

```text
.
|-- app.js
|-- server.js
|-- config/
|-- controllers/
|-- middleware/
|-- models/
|-- routes/
|-- scripts/
|-- tests/
`-- uploads/
```

- `app.js`: creates the Express app and wires routes and middleware
- `server.js`: loads environment variables, connects to MongoDB, and starts the HTTP server
- `config/`: database bootstrap code
- `controllers/`: request handlers for auth, users, products, orders, print requests, and dashboard data
- `middleware/`: async wrapper, auth checks, upload handling, and error handling
- `models/`: Mongoose schemas for users, products, orders, and print requests
- `routes/`: route modules grouped by domain
- `scripts/`: maintenance and validation scripts
- `tests/`: API smoke tests
- `uploads/`: uploaded files served statically from `/uploads`

## Authentication

- Protected routes expect `Authorization: Bearer <token>`
- Users are assigned a role of either `customer` or `admin`
- Admin-only routes are protected by the `adminOnly` middleware

## API Routes

Base URL: `http://localhost:5000`

### Public Routes

- `GET /`: backend status message
- `GET /api/health`: health check
- `POST /api/auth/register`: register a new user
- `POST /api/auth/login`: authenticate a user and return a JWT
- `GET /api/products`: list all products with optional filters
- `GET /api/products/:id`: get a single product

### Authenticated User Routes

- `GET /api/users/profile`: get the logged-in user profile
- `POST /api/orders`: create an order
- `GET /api/orders/my-orders`: get orders for the logged-in user
- `GET /api/orders/:id`: get a single order if owned by the user or requested by an admin
- `POST /api/print-requests`: create a print request with file upload
- `GET /api/print-requests/my-requests`: get print requests for the logged-in user
- `GET /api/print-requests/:id`: get a single print request if owned by the user or requested by an admin

### Admin Routes

- `GET /api/users`: list users
- `GET /api/users/:id`: get a single user
- `PUT /api/users/:id`: update a user
- `DELETE /api/users/:id`: delete a user
- `POST /api/products`: create a product
- `PUT /api/products/:id`: update a product
- `DELETE /api/products/:id`: delete a product
- `GET /api/orders`: list all orders
- `PUT /api/orders/:id/status`: update order status
- `GET /api/print-requests`: list all print requests
- `PUT /api/print-requests/:id/status`: update print request status
- `DELETE /api/print-requests/:id`: delete a print request
- `GET /api/dashboard/summary`: get dashboard totals and revenue summary
- `GET /api/dashboard/low-stock`: get low-stock products

## Query Parameters

Supported filters currently include:

- Products: `search`, `category`, `isAvailable`, `minPrice`, `maxPrice`
- Users: `search`, `role`
- Orders: `status`, `customerName`
- Print requests: `status`, `customerName`, `printType`, `paperSize`

## Uploads

- Uploaded files are stored in the local `uploads/` directory
- Static file access is exposed through `/uploads`
- Allowed upload types: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`, `.jpeg`
- Maximum upload size: `10MB`

## Business Rules

- Order creation decreases product stock immediately
- If order creation fails after stock reservation, stock is rolled back
- Products are automatically marked unavailable when stock reaches zero
- Print request statuses: `pending`, `accepted`, `printing`, `completed`, `rejected`
- Order statuses: `pending`, `processing`, `completed`, `cancelled`

## Testing

Current automated coverage is lightweight and focuses on smoke tests:

- `GET /api/health`
- `GET /`
- Unknown route error handling

Run all validation with:

```bash
npm run check
```

## Notes

- Real uploaded assets are ignored by git; only `uploads/.gitkeep` is tracked
- Local secrets are not committed; use `.env.example` as the template
- This project currently uses simple controller-level validation rather than a dedicated schema validation layer
