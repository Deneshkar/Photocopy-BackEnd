# Photocopy Backend

Node.js and Express backend for a photocopy shop application. The API covers authentication, user management, products, orders, print requests, dashboard reporting, and uploaded file serving.

## Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads

## Project Structure

- `app.js`: Express app factory and route wiring
- `server.js`: environment bootstrap, database connection, and server start
- `config/`: database connection setup
- `controllers/`: request handlers for each domain
- `middleware/`: auth, upload, async, and error middleware
- `models/`: Mongoose schemas
- `routes/`: API route definitions
- `tests/`: basic API smoke tests

## Environment Variables

Create a `.env` file based on `.env.example`.

- `PORT`: server port, defaults to `5000`
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: secret used to sign auth tokens
- `NODE_ENV`: runtime environment

## Install and Run

```bash
npm install
npm run dev
```

Production start:

```bash
npm start
```

Validation and tests:

```bash
npm run check
```

## API Overview

Base URL examples assume `http://localhost:5000`.

- `GET /`: backend status message
- `GET /api/health`: health check
- `POST /api/auth/register`: register a user
- `POST /api/auth/login`: log in and receive a JWT
- `GET /api/users/profile`: current authenticated user profile
- `GET /api/products`: list products
- `POST /api/orders`: create an order for the authenticated user
- `POST /api/print-requests`: create a print request with an uploaded file
- `GET /api/dashboard/summary`: admin dashboard totals

## Notes

- Uploaded files are served from `/uploads`.
- The `uploads/` folder is kept in git with a placeholder file, while real uploaded assets are ignored.
- Current automated tests cover health, root, and unknown-route responses.
