const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const College = require('../../src/models/College');
const Review = require('../../src/models/Review');

describe('Review Integration Tests', () => {
  let student1Token;
  let student2Token;
  let adminToken;
  let student1;
  let student2;
  let testCollege;

  beforeEach(async () => {
    student1 = await User.create({
      name: 'Student One',
      email: 'student1@test.com',
      password: 'Password123!',
      role: 'student',
    });
    student1Token = student1.generateAuthToken();

    student2 = await User.create({
      name: 'Student Two',
      email: 'student2@test.com',
      password: 'Password123!',
      role: 'student',
    });
    student2Token = student2.generateAuthToken();

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin',
    });
    adminToken = admin.generateAuthToken();

    testCollege = await College.create({
      name: 'Review Test College',
      location: '123 Campus Dr',
      city: 'Boston',
      description: 'A college for testing review aggregations and permissions.',
    });
  });

  describe('POST /api/v1/colleges/:collegeId/reviews', () => {
    it('should allow student to submit a review and update college stats', async () => {
      const res = await request(app)
        .post(`/api/v1/colleges/${testCollege._id}/reviews`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          rating: 4,
          title: 'Great campus experience',
          comment: 'The campus facilities and course syllabus are top notch.',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(4);
      expect(res.body.data.review.user.name).toBe('Student One');

      const updatedCollege = await College.findById(testCollege._id);
      expect(updatedCollege.averageRating).toBe(4);
      expect(updatedCollege.reviewCount).toBe(1);
    });

    it('should reject a second review from the same user for the same college', async () => {
      await Review.create({
        college: testCollege._id,
        user: student1._id,
        rating: 5,
        comment: 'First review here.',
      });

      const res = await request(app)
        .post(`/api/v1/colleges/${testCollege._id}/reviews`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          rating: 3,
          comment: 'Trying to review again.',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject rating values outside 1-5', async () => {
      const res = await request(app)
        .post(`/api/v1/colleges/${testCollege._id}/reviews`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          rating: 6,
          comment: 'Invalid rating above 5.',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/colleges/:collegeId/reviews', () => {
    beforeEach(async () => {
      await Review.create([
        {
          college: testCollege._id,
          user: student1._id,
          rating: 5,
          title: 'Loved it',
          comment: 'Best environment for learning.',
        },
        {
          college: testCollege._id,
          user: student2._id,
          rating: 3,
          title: 'Average',
          comment: 'Decent programs but expensive living.',
        },
      ]);
    });

    it('should fetch paginated reviews for a college', async () => {
      const res = await request(app).get(`/api/v1/colleges/${testCollege._id}/reviews`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews.length).toBe(2);
      expect(res.body.meta.total).toBe(2);
    });

    it('should filter reviews by rating', async () => {
      const res = await request(app).get(`/api/v1/colleges/${testCollege._id}/reviews?rating=5`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.reviews.length).toBe(1);
      expect(res.body.data.reviews[0].rating).toBe(5);
    });
  });

  describe('PUT /api/v1/reviews/:id', () => {
    let review;

    beforeEach(async () => {
      review = await Review.create({
        college: testCollege._id,
        user: student1._id,
        rating: 3,
        comment: 'Initial 3 star review comment.',
      });
      await Review.calculateAverageRating(testCollege._id);
    });

    it('should allow author to update review and recalculate college average', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          rating: 5,
          comment: 'Updated to 5 star review after improvement.',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.review.rating).toBe(5);

      const updatedCollege = await College.findById(testCollege._id);
      expect(updatedCollege.averageRating).toBe(5);
    });

    it('should forbid non-author from updating review', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          rating: 1,
          comment: 'Malicious modification attempt.',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    let review;

    beforeEach(async () => {
      review = await Review.create({
        college: testCollege._id,
        user: student1._id,
        rating: 4,
        comment: 'Review to be deleted.',
      });
      await Review.calculateAverageRating(testCollege._id);
    });

    it('should allow author to delete review and update stats', async () => {
      const res = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.statusCode).toBe(200);

      const findRes = await Review.findById(review._id);
      expect(findRes).toBeNull();

      const updatedCollege = await College.findById(testCollege._id);
      expect(updatedCollege.averageRating).toBe(0);
      expect(updatedCollege.reviewCount).toBe(0);
    });

    it('should allow admin to delete any review', async () => {
      const res = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
