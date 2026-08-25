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

### 🔑 Authentication (example)

- `POST /auth/login`

---

### 📄 CV Routes

| Method | Endpoint        | Description                      |
| ------ | --------------- | -------------------------------- |
| GET    | /cv             | Get all CVs (authenticated user) |
| GET    | /cv/:id         | Get CV by ID                     |
| POST   | /cv             | Create a CV                      |
| PATCH  | /cv/:id         | Update a CV                      |
| DELETE | /cv/:id         | Soft delete a CV                 |
| GET    | /cv/recover/:id | Restore a CV                     |
| GET    | /cv/stats       | Get CV statistics                |

---

## 🧪 Example Request

```json
POST /cv
Authorization: Bearer <token>

{
  "name": "Doe",
  "firstname": "John",
  "age": 30,
  "cin": 123456,
  "job": "Software Engineer"
}

## Key Concepts Implemented

* Custom decorators (@User())
* JWT Strategy with Passport
* Guards for route protection
* Entity relationships (OneToMany / ManyToOne)
* Query Builder (advanced SQL queries)
* Clean and maintainable architecture

🚀 Getting Started
1. Clone the project

git clone https://github.com/mcdchristian/cv-tech-project.git
cd cv-management-api

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file:

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_db
SECRET=your_jwt_secret

4. Run the project

npm run start:dev

👨‍💻 Author

Del'or Mutaliko
Fullstack JavaScript Developer
Specialized in Node.js, NestJS, and scalable backend systems.
```

## CV Tech Project

This project is a NestJS application providing API services.
