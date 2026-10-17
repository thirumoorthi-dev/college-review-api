const express = require('express');
const {
  createReview,
  getCollegeReviews,
  getReviewById,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
} = require('../validations/reviewValidation');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    protect,
    authorize('student', 'teacher', 'admin'),
    validate(createReviewSchema),
    createReview
  )
  .get(validate(reviewQuerySchema, 'query'), getCollegeReviews);

router
  .route('/:id')
  .get(getReviewById)
  .put(protect, validate(updateReviewSchema), updateReview)
  .delete(protect, deleteReview);

module.exports = router;
