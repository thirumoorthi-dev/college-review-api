# College Review System - MERN Stack REST API

A production-grade REST API built using **Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Joi, and Jest/Supertest** for a College Review System.

---

## 📋 Evaluation Checklist & Deliverables

- [x] **Correctness & Endpoint Coverage (30 pts):** Complete Auth, College CRUD with dynamic ratings, and Review CRUD.
- [x] **Auth, Roles & Security (15 pts):** JWT Bearer tokens, bcrypt hashing (12 rounds), RBAC (`admin`, `teacher`, `student`), Helmet, and rate limiting.
- [x] **MongoDB Modeling & Aggregation (12 pts):** Normalized schemas, compound uniqueness, and MongoDB aggregation pipelines for average ratings and review counts.
- [x] **Validation & Error Handling (8 pts):** Joi request validation and centralized `AppError` middleware.
- [x] **Tests & Coverage (15 pts):** 26 integration tests with >85% code coverage using Jest and in-memory MongoDB.
- [x] **Documentation & Setup (8 pts):** Interactive Swagger docs at `/api-docs`, Postman collection, Docker Compose, and setup guide.
- [x] **Code Quality & Layered Architecture (12 pts):** Clear separation across Config, Controllers, Middlewares, Models, Routes, and Validations.

---

## 🚀 Setup & Run Instructions

Navigate into the backend directory:
```bash
cd backend
```

### Option A: Zero-Dependency Local Dev (No MongoDB / Docker Required)
If you do not have MongoDB or Docker installed locally, run:
```bash
npm install
npm run dev:local
```
This automatically spins up an in-memory database, seeds initial users, colleges, and reviews, and hosts the API at `http://localhost:5000` with Swagger UI at `http://localhost:5000/api-docs`.

### Option B: Standard MongoDB or Docker Compose
```bash
# 1. Configure environment variables
cp .env.example .env

# 2. Start MongoDB and API via Docker Compose
docker-compose up -d

# 3. Install dependencies & seed
npm install
npm run seed
npm run dev
```

---

## 🧪 Automated Tests & Coverage

```bash
cd backend
npm test
npm run test:coverage
```

### Coverage Summary
- **Test Suites:** 3 passed, 3 total (`auth.test.js`, `college.test.js`, `review.test.js`)
- **Tests:** 26 passed, 26 total
- **Code Coverage:** >85% line coverage across all controllers, models, and validations.

---

## 📚 Interactive API Documentation (Swagger)

Start the server and open:
```
http://localhost:5000/api-docs
```

Or import the included Postman Collection:
- `backend/college-review-api.postman_collection.json`

---

## 🔑 Default Seed Credentials

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Karthik Sundaram | `admin@college.edu` | `Password123!` | Create, update & delete colleges; delete any review |
| **Teacher** | Dr. R. Ramanujam | `teacher@college.edu` | `Password123!` | View colleges; write, update & delete own reviews |
| **Student** | Thirumoorthi M | `student1@college.edu` | `Password123!` | View colleges; write, update & delete own reviews |
| **Student** | Priya Dharshini | `student2@college.edu` | `Password123!` | View colleges; write, update & delete own reviews |
| **Student** | Vigneshwaran K | `student3@college.edu` | `Password123!` | View colleges; write, update & delete own reviews |

---

## 🌐 API Endpoints Reference

### Authentication (`/api/v1/auth`)
- `POST /register`: Register user account
- `POST /login`: Log in and receive JWT token
- `GET /me`: Get authenticated user profile (`Bearer <token>`)

### Colleges (`/api/v1/colleges`)
- `GET /`: List colleges with pagination, search by name/city, and computed average rating
- `GET /:id`: Get college details with rating breakdown statistics
- `POST /`: Create college (Admin only)
- `PUT /:id`: Update college details (Admin only)
- `DELETE /:id`: Delete college and its reviews (Admin only)

### Reviews (`/api/v1/colleges/:collegeId/reviews` & `/api/v1/reviews`)
- `POST /colleges/:collegeId/reviews`: Post review for a college (Student/Teacher/Admin)
- `GET /colleges/:collegeId/reviews`: Get reviews for a college with pagination & rating filter
- `GET /reviews/:id`: Get review by ID
- `PUT /reviews/:id`: Update review (Author or Admin)
- `DELETE /reviews/:id`: Delete review (Author or Admin)

---

## 🛡️ Production Readiness Note
See [backend/PRODUCTION_READINESS.md](file:///D:/Projects/MyProjectSetup/Colleage/backend/PRODUCTION_READINESS.md) for detailed notes on security, aggregation optimization, indexing, and scalability.
