const express = require('express');
const {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
} = require('../controllers/collegeController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  createCollegeSchema,
  updateCollegeSchema,
  collegeQuerySchema,
} = require('../validations/collegeValidation');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:collegeId/reviews', reviewRouter);

router
  .route('/')
  .get(validate(collegeQuerySchema, 'query'), getColleges)
  .post(protect, authorize('admin'), validate(createCollegeSchema), createCollege);

router
  .route('/:id')
  .get(getCollegeById)
  .put(protect, authorize('admin', 'teacher'), validate(updateCollegeSchema), updateCollege)
  .delete(protect, authorize('admin'), deleteCollege);

module.exports = router;
