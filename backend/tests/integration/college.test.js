const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const College = require('../../src/models/College');
const Review = require('../../src/models/Review');

describe('College Integration Tests', () => {
  let adminToken;
  let studentToken;
  let adminUser;
  let studentUser;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin Test',
      email: 'admintest@test.com',
      password: 'Password123!',
      role: 'admin',
    });
    adminToken = adminUser.generateAuthToken();

    studentUser = await User.create({
      name: 'Student Test',
      email: 'studenttest@test.com',
      password: 'Password123!',
      role: 'student',
    });
    studentToken = studentUser.generateAuthToken();
  });

  describe('POST /api/v1/colleges', () => {
    it('should allow admin to create a college', async () => {
      const res = await request(app)
        .post('/api/v1/colleges')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Harvard Test University',
          location: '123 College Ave',
          city: 'Cambridge',
          state: 'MA',
          description: 'A prestigious test university with great faculty.',
          website: 'https://harvard.edu',
          establishedYear: 1636,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.college.name).toBe('Harvard Test University');
      expect(res.body.data.college.averageRating).toBe(0);
    });

    it('should forbid student from creating a college', async () => {
      const res = await request(app)
        .post('/api/v1/colleges')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Student College',
          location: 'Test Location',
          city: 'Test City',
          description: 'Test Description that is long enough.',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for unauthenticated user', async () => {
      const res = await request(app)
        .post('/api/v1/colleges')
        .send({
          name: 'Anonymous College',
          location: 'Test Location',
          city: 'Test City',
          description: 'Test Description that is long enough.',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/colleges', () => {
    beforeEach(async () => {
      const col1 = await College.create({
        name: 'MIT Test',
        location: '77 Mass Ave',
        city: 'Cambridge',
        description: 'Tech university focused on science and engineering.',
      });
      const col2 = await College.create({
        name: 'Stanford Test',
        location: '450 Jane Stanford Way',
        city: 'Stanford',
        description: 'Silicon valley university focused on tech and arts.',
      });

      await Review.create({
        college: col1._id,
        user: studentUser._id,
        rating: 5,
        comment: 'Brilliant engineering courses.',
      });
      await Review.calculateAverageRating(col1._id);
    });

    it('should list colleges with aggregated average ratings and review counts', async () => {
      const res = await request(app).get('/api/v1/colleges');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.colleges.length).toBe(2);
      expect(res.body.meta.total).toBe(2);

      const mit = res.body.data.colleges.find((c) => c.name === 'MIT Test');
      expect(mit).toBeDefined();
      expect(mit.averageRating).toBe(5);
      expect(mit.reviewCount).toBe(1);
    });

    it('should filter colleges by search keyword', async () => {
      const res = await request(app).get('/api/v1/colleges?search=Stanford');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.colleges.length).toBe(1);
      expect(res.body.data.colleges[0].name).toBe('Stanford Test');
    });

    it('should safely handle special regex characters in search without crashing', async () => {
      const res = await request(app).get('/api/v1/colleges?search=(MIT*+[');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.colleges).toBeDefined();
    });

    it('should filter colleges by city', async () => {
      const res = await request(app).get('/api/v1/colleges?city=Cambridge');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.colleges.length).toBe(1);
      expect(res.body.data.colleges[0].city).toBe('Cambridge');
    });
  });

  describe('GET /api/v1/colleges/:id', () => {
    it('should return college details with rating breakdown', async () => {
      const college = await College.create({
        name: 'Caltech Test',
        location: 'Pasadena',
        city: 'Pasadena',
        description: 'Elite science and engineering university.',
      });

      await Review.create({
        college: college._id,
        user: studentUser._id,
        rating: 4,
        comment: 'Great research opportunities.',
      });

      const res = await request(app).get(`/api/v1/colleges/${college._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.college.name).toBe('Caltech Test');
      expect(res.body.data.stats.totalReviews).toBe(1);
      expect(res.body.data.stats.averageRating).toBe(4);
    });

    it('should return 404 for non-existent college ID', async () => {
      const fakeId = new User()._id;
      const res = await request(app).get(`/api/v1/colleges/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/colleges/:id and DELETE /api/v1/colleges/:id', () => {
    it('should allow admin to update and delete college', async () => {
      const college = await College.create({
        name: 'Update Delete College',
        location: 'Location',
        city: 'City',
        description: 'Description before update.',
      });

      const updateRes = await request(app)
        .put(`/api/v1/colleges/${college._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Description updated successfully.' });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.college.description).toBe('Description updated successfully.');

      const deleteRes = await request(app)
        .delete(`/api/v1/colleges/${college._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.statusCode).toBe(200);

      const findRes = await College.findById(college._id);
      expect(findRes).toBeNull();
    });
  });
});
