# Photocopy Shop Backend API

Production-ready REST API for a photocopy shop workflow, built with Node.js, Express, and MongoDB.

This service handles:

- authentication and authorization
- product catalog management
- order processing with stock consistency
- print request uploads and lifecycle tracking
- admin dashboard reporting
- profit tracking with manual income/expense entries
- lightweight AI print-assist suggestions

## Table of Contents

- Overview
- Tech Stack
- Key Capabilities
- Project Structure
- Prerequisites
- Quick Start
- Environment Variables
- Scripts
- Authentication and Authorization
- API Endpoints
- Query Filters
- File Uploads
- Business Rules
- Testing
- Error Handling
- Security Notes

## Overview

Base URL (local):

```text
http://localhost:5000
```

Health checks:

- `GET /`
- `GET /api/health`

## Tech Stack

- Node.js
- Express 5
- MongoDB + Mongoose
- JSON Web Token (JWT)
- Multer (multipart file uploads)
- bcryptjs (password hashing)
- node:test + supertest (testing)
- nodemon (local development)

## Key Capabilities

- JWT login and role-based access (`customer`, `admin`)
- Full product CRUD for admins, public product browsing for customers
- Order creation with stock deduction and rollback safeguards
- Print requests with file upload and status transitions
- Admin dashboards for summary metrics and low-stock products
- Profit summary combining completed-order revenue and manual entries
- AI print-assist endpoint for print setting suggestions

## Project Structure

```text
.
|-- app.js
|-- server.js
|-- config/
|   `-- db.js
|-- controllers/
|-- middleware/
|-- models/
|-- routes/
|-- services/
|-- scripts/
|   `-- check.js
|-- tests/
|   `-- app.test.js
`-- uploads/
```

Core files:

- `app.js`: Express app factory, middleware registration, route mounting
- `server.js`: environment loading, DB connection, HTTP bootstrapping
- `config/db.js`: MongoDB connection logic

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root

```env
PORT=5000
MONGO_URL=your-mongodb-connection-string
JWT_SECRET=your-strong-secret
NODE_ENV=development
```

3. Start the API

```bash
npm run dev
```

For production-style run:

```bash
npm start
```

## Environment Variables

| Variable     | Required | Description                                         |
| ------------ | -------- | --------------------------------------------------- |
| `PORT`       | No       | HTTP server port. Defaults to `5000`.               |
| `MONGO_URL`  | Yes      | MongoDB connection string used by Mongoose.         |
| `JWT_SECRET` | Yes      | Secret used to sign JWT access tokens.              |
| `NODE_ENV`   | No       | Runtime mode (`development`, `production`, `test`). |

## Scripts

- `npm run dev`: start server with nodemon
- `npm start`: start server with Node.js
- `npm test`: run tests (`node --test`)
- `npm run check`: run syntax check script and then tests

## Authentication and Authorization

Auth model:

- login/register returns JWT token
- protected routes require header: `Authorization: Bearer <token>`
- role checks enforce admin-only resources

Roles:

- `customer`: can view products, place orders, create and view own print requests, view own orders
- `admin`: full access to users, products, order administration, print request administration, dashboard analytics, profit management

## API Endpoints

### Public

- `GET /`
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/ai/print-assist`

### Authenticated User

- `GET /api/users/profile`
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/:id`
- `POST /api/print-requests` (multipart form-data with file)
- `GET /api/print-requests/my-requests`
- `GET /api/print-requests/:id`

### Admin

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `PUT /api/orders/:id/status`
- `GET /api/print-requests`
- `PUT /api/print-requests/:id/status`
- `DELETE /api/print-requests/:id`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/low-stock`
- `GET /api/profit/summary`
- `GET /api/profit/entries`
- `POST /api/profit/entries`
- `PUT /api/profit/entries/:id`
- `DELETE /api/profit/entries/:id`

## Query Filters

Supported query parameters:

- Products: `search`, `category`, `isAvailable`, `minPrice`, `maxPrice`
- Users: `search`, `role`
- Orders: `status`, `customerName`
- Print requests: `status`, `customerName`, `printType`, `paperSize`

## File Uploads

Upload behavior:

- storage location: `uploads/`
- static access path: `/uploads`
- field name for single-file uploads: `file`
- upload-enabled endpoints:
  - `POST /api/print-requests`
  - `POST /api/products`
  - `PUT /api/products/:id`

Accepted extensions:

- `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`, `.jpeg`

Max file size:

- `10 MB`

## Business Rules

- Creating an order immediately decrements product stock
- If order creation fails after stock reservation, stock is rolled back
- Products are marked unavailable when stock reaches zero
- Order statuses: `pending`, `processing`, `completed`, `cancelled`
- Print request statuses: `pending`, `accepted`, `printing`, `completed`, `rejected`

## Testing

Run tests:

```bash
npm test
```

Run full local validation:

```bash
npm run check
```

Current automated tests cover:

- API health endpoint
- root endpoint
- unknown-route error flow

## Error Handling

- Unknown routes are handled by centralized `notFound` middleware
- Runtime and validation errors are normalized by centralized error middleware
- In development, stack traces may be included for easier debugging

## Security Notes

- Do not commit real secrets; keep `.env` local
- Use a strong, random `JWT_SECRET`
- Uploaded files are validated by extension and size, but should still be treated as untrusted content
- This project currently performs validation mostly at controller level; consider adding schema validation for stricter input safety
