# 🚀 CV Management API

A scalable and secure RESTful API built with NestJS for managing CVs with user authentication and role-based access.

---

## 📌 Overview

This project is a backend application designed to manage CVs (Curriculum Vitae) with full CRUD operations. It includes authentication using JWT, secure routes, and a relational database structure using TypeORM.

The API allows users to:

- Create and manage their own CVs
- Authenticate securely using JWT
- Access protected routes
- Perform advanced queries (e.g., statistics by age)

---

## 🛠️ Tech Stack

- **Node.js**
- **NestJS**
- **TypeScript**
- **TypeORM**
- **MySQL**
- **JWT Authentication (Passport.js)**

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

### How it works:

1. User logs in and receives a token
2. Token must be sent in headers:

Authorization: Bearer <your_token>

3. Protected routes are secured using `JwtAuthGuard`

---

## 📂 Project Structure

src/
│
├── user/
│ ├── entities/
│ ├── strategy/
│ ├── guards/
│
├── cv/
│ ├── entities/
│ ├── dto/
│ ├── service/
│ ├── controller/
│
├── decorators/
├── generics/
├── enums/

---

## ⚙️ Features

### ✅ CV Management

- Create CV
- Update CV
- Delete CV (soft & hard delete)
- Restore CV
- Get CV by ID
- Get all CVs (user-specific)

### ✅ Authentication & Security

- JWT-based authentication
- Route protection with Guards
- Secure user data handling

### ✅ Database

- Relational mapping with TypeORM
- User ↔ CV relationship
- Query Builder for advanced queries

### ✅ Advanced

- Statistics endpoint (CV count by age)
- Clean architecture and modular design

---

## 📡 API Endpoints

All routes are served under the `api/v1` prefix. Interactive documentation
(Swagger UI) is available at `GET /api/v1/api-docs`.

### 🔑 Authentication

| Method | Endpoint           | Description                       |
| ------ | ------------------ | --------------------------------- |
| POST   | /api/v1/user       | Register an account               |
| POST   | /api/v1/user/login | Log in with username **or** email |

Both routes are rate limited to 5 requests per minute.

---

### 📄 CV Routes

Every CV route requires `Authorization: Bearer <token>` and only ever sees
the CVs of the authenticated user.

| Method | Endpoint               | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| GET    | /api/v1/cv             | Get all CVs (authenticated user)      |
| GET    | /api/v1/cv/:id         | Get CV by ID                          |
| POST   | /api/v1/cv             | Create a CV                           |
| PATCH  | /api/v1/cv/:id         | Update a CV                           |
| DELETE | /api/v1/cv/:id         | Soft delete a CV                      |
| PATCH  | /api/v1/cv/:id/restore | Restore a soft-deleted CV             |
| GET    | /api/v1/cv/stats       | CV count per age (`?minAge=&maxAge=`) |

---

### 🩺 Operations

| Method | Endpoint         | Description                      |
| ------ | ---------------- | -------------------------------- |
| GET    | /api/v1/health   | Liveness probe (status + uptime) |
| GET    | /api/v1/api-docs | Swagger UI                       |

---

## 🧪 Example Request

## 🧪 Example Request

```http
POST /api/v1/cv
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Doe",
  "firstname": "John",
  "age": 30,
  "cin": 123456,
  "job": "Software Engineer"
}
```

---

## 🧠 Key Concepts Implemented

- Custom decorators (`@User()`)
- JWT Strategy with Passport
- Guards for route protection
- Entity relationships (OneToMany / ManyToOne)
- Query Builder (advanced SQL queries)
- Global exception filter and request logging middleware
- Rate limiting (`@nestjs/throttler`)
- Clean and maintainable architecture

---

## 🚀 Getting Started

### 1. Clone the project

```bash
git clone https://github.com/mcdchristian/cv-tech-project.git
cd cv-tech-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

`SECRET` has no default: the application refuses to start without it.

### 4. Run the project

Two options.

**a. Everything in Docker** — nothing to install locally:

```bash
docker compose up --build
```

MySQL is published on port **3307** on the host (3306 is usually taken by a
locally installed MySQL); override with `DB_PUBLISHED_PORT`. The stack sets
`DB_SYNCHRONIZE=true` so TypeORM creates the schema at boot — this project has
no migrations yet, so never point it at a real database.

**b. Local MySQL** — create the database once, then run in watch mode:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cv_tech;"
npm run start:dev
```

The API then listens on http://localhost:3000/api/v1, with Swagger UI on
http://localhost:3000/api/v1/api-docs

### 5. Run the checks

```bash
npm run lint:check && npm test && npm run build
```

| Command              | Needs a database                         |
| -------------------- | ---------------------------------------- |
| `npm test`           | no                                       |
| `npm run test:cov`   | no                                       |
| `npm run lint:check` | no                                       |
| `npm run build`      | no                                       |
| `npm run test:e2e`   | **yes** — it boots the whole `AppModule` |

Coverage sits on the rules that matter — CV ownership and the credential
round-trip — rather than on the controllers, which only the e2e smoke test
touches.

---

## 🖥️ Frontend

A React + Vite client lives in `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

It runs on http://localhost:4200 and reads the API URL from `VITE_API_URL`.

---

## 👨‍💻 Author

**Del'or Mutaliko** — Fullstack JavaScript Developer, specialized in
Node.js, NestJS, and scalable backend systems.
