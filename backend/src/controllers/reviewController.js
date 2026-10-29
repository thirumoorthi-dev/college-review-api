const mongoose = require('mongoose');
const Review = require('../models/Review');
const College = require('../models/College');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

const escapeRegex = require('../utils/escapeRegex');

const createReview = asyncHandler(async (req, res, next) => {
  const collegeId = req.params.collegeId || req.body.collegeId;
  const { rating, comment, title } = req.body;

  if (!mongoose.Types.ObjectId.isValid(collegeId)) {
    return next(new AppError('Invalid college ID format', 400));
  }

  const college = await College.findById(collegeId);
  if (!college) {
    return next(new AppError('College not found', 404));
  }

  const existingReview = await Review.findOne({
    college: collegeId,
    user: req.user._id,
  });

  if (existingReview) {
    return next(new AppError('You have already submitted a review for this college', 409));
  }

  const review = await Review.create({
    rating,
    comment,
    title,
    college: collegeId,
    user: req.user._id,
  });

  const populatedReview = await Review.findById(review._id)
    .populate('user', 'name role')
    .populate('college', 'name city');

  return sendResponse(res, 201, 'Review submitted successfully', {
    review: populatedReview,
  });
});

const getCollegeReviews = asyncHandler(async (req, res, next) => {
  const { collegeId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || 'newest';
  const rating = req.query.rating ? parseInt(req.query.rating, 10) : null;
  const search = req.query.search ? req.query.search.trim() : '';

  if (!mongoose.Types.ObjectId.isValid(collegeId)) {
    return next(new AppError('Invalid college ID format', 400));
  }

  const filter = { college: collegeId };

  if (rating) {
    filter.rating = rating;
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { comment: { $regex: safeSearch, $options: 'i' } },
      { title: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  let sortCriteria = { createdAt: -1 };
  if (sort === 'oldest') {
    sortCriteria = { createdAt: 1 };
  } else if (sort === 'rating_desc') {
    sortCriteria = { rating: -1, createdAt: -1 };
  } else if (sort === 'rating_asc') {
    sortCriteria = { rating: 1, createdAt: -1 };
  }

  const [total, reviews] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .populate('user', 'name role')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit),
  ]);

  return sendResponse(
    res,
    200,
    'Reviews fetched successfully',
    { reviews },
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    }
  );
});

const getReviewById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid review ID format', 400));
  }

  const review = await Review.findById(id)
    .populate('user', 'name role')
    .populate('college', 'name city location');

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  return sendResponse(res, 200, 'Review fetched successfully', { review });
});

const updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment, title } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid review ID format', 400));
  }

  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not authorized to update this review', 403));
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  if (title !== undefined) review.title = title;

  await review.save();

  const updatedReview = await Review.findById(id)
    .populate('user', 'name role')
    .populate('college', 'name');

  return sendResponse(res, 200, 'Review updated successfully', {
    review: updatedReview,
  });
});

const deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid review ID format', 400));
  }

  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isTeacher = req.user.role === 'teacher';

  if (!isOwner && !isAdmin && !isTeacher) {
    return next(new AppError('You are not authorized to delete this review', 403));
  }

  await Review.findByIdAndDelete(id);

  return sendResponse(res, 200, 'Review deleted successfully', null);
});

module.exports = {
  createReview,
  getCollegeReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
