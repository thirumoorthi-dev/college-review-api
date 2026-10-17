# College Review System - Backend REST API

Production-grade Express.js REST API with MongoDB for College Review System with role-based access, average rating aggregation, validation, and testing.

## Local Quick Start

### Option 1: Zero-Dependency Local Dev (No MongoDB / Docker Required)
If you do not have MongoDB or Docker installed locally, run:
```bash
npm run dev:local
```
This automatically spins up an in-memory MongoDB instance, seeds all test data (colleges, users, reviews), and serves the API at `http://localhost:5000` with Swagger UI at `http://localhost:5000/api-docs`.

---

### Option 2: Standard MongoDB or Docker
```bash
cp .env.example .env
docker-compose up -d
npm install
npm run seed
npm run dev
```

---

## Running Integration Tests
```bash
npm test
npm run test:coverage
```
All 26 integration tests run on an isolated in-memory MongoDB runner with >85% code coverage.

## API Documentation
- Interactive Swagger UI: `http://localhost:5000/api-docs`
- Postman Collection: `college-review-api.postman_collection.json`
