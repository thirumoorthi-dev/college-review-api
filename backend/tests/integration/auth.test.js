const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully and return JWT token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Student',
          email: 'student@test.com',
          password: 'Password123!',
          role: 'student',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('student@test.com');
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.user.password).toBeUndefined();

      const userInDb = await User.findOne({ email: 'student@test.com' });
      expect(userInDb).not.toBeNull();
    });

    it('should reject registration if email is already registered', async () => {
      await User.create({
        name: 'Existing User',
        email: 'duplicate@test.com',
        password: 'Password123!',
        role: 'student',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another User',
          email: 'duplicate@test.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'A',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration attempt with admin role to prevent privilege escalation', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Malicious User',
          email: 'adminattempt@test.com',
          password: 'Password123!',
          role: 'admin',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow registration as teacher', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Professor Test',
          email: 'prof@test.com',
          password: 'Password123!',
          role: 'teacher',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('teacher');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@test.com',
        password: 'Password123!',
        role: 'teacher',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@test.com');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nobody@test.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return profile for authenticated user', async () => {
      const user = await User.create({
        name: 'Me User',
        email: 'me@test.com',
        password: 'Password123!',
        role: 'student',
      });
      const token = user.generateAuthToken();

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('me@test.com');
    });

    it('should return 401 when accessing without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
