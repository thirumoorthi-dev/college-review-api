const mongoose = require('mongoose');
const College = require('../models/College');
const Review = require('../models/Review');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

const escapeRegex = require('../utils/escapeRegex');

const createCollege = asyncHandler(async (req, res, next) => {
  const { name, location, city, state, description, website, establishedYear } = req.body;

  const existingCollege = await College.findOne({ name });
  if (existingCollege) {
    return next(new AppError('A college with this name already exists', 409));
  }

  const college = await College.create({
    name,
    location,
    city,
    state,
    description,
    website,
    establishedYear,
    createdBy: req.user._id,
  });

  return sendResponse(res, 201, 'College created successfully', { college });
});

const getColleges = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search ? req.query.search.trim() : '';
  const city = req.query.city ? req.query.city.trim() : '';
  const sort = req.query.sort || 'rating_desc';

  const matchStage = {};

  if (search) {
    const safeSearch = escapeRegex(search);
    matchStage.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { location: { $regex: safeSearch, $options: 'i' } },
      { city: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (city) {
    const safeCity = escapeRegex(city);
    matchStage.city = { $regex: `^${safeCity}$`, $options: 'i' };
  }

  let sortStage = { averageRating: -1, reviewCount: -1 };
  if (sort === 'rating_asc') {
    sortStage = { averageRating: 1 };
  } else if (sort === 'newest') {
    sortStage = { createdAt: -1 };
  } else if (sort === 'name_asc') {
    sortStage = { name: 1 };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'college',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        reviewCount: { $size: '$reviews' },
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $round: [{ $avg: '$reviews.rating' }, 1] },
            else: 0,
          },
        },
      },
    },
    {
      $project: {
        reviews: 0,
      },
    },
    { $sort: sortStage },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];

  const results = await College.aggregate(pipeline);
  const total = results[0]?.metadata[0]?.total || 0;
  const colleges = results[0]?.data || [];

  return sendResponse(
    res,
    200,
    'Colleges fetched successfully',
    { colleges },
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    }
  );
});

const getCollegeById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid college ID format', 400));
  }

  const college = await College.findById(id).populate('createdBy', 'name email role');
  if (!college) {
    return next(new AppError('College not found', 404));
  }

  const stats = await Review.aggregate([
    { $match: { college: new mongoose.Types.ObjectId(id) } },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        ratingBreakdown: [
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
        ],
      },
    },
  ]);

  const overall = stats[0]?.overall[0] || { averageRating: 0, totalReviews: 0 };
  const ratingBreakdown = stats[0]?.ratingBreakdown || [];

  return sendResponse(res, 200, 'College details fetched successfully', {
    college,
    stats: {
      averageRating: overall.averageRating ? Math.round(overall.averageRating * 10) / 10 : 0,
      totalReviews: overall.totalReviews || 0,
      breakdown: ratingBreakdown,
    },
  });
});

const updateCollege = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid college ID format', 400));
  }

  const college = await College.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!college) {
    return next(new AppError('College not found', 404));
  }

  return sendResponse(res, 200, 'College updated successfully', { college });
});

const deleteCollege = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid college ID format', 400));
  }

  const college = await College.findByIdAndDelete(id);
  if (!college) {
    return next(new AppError('College not found', 404));
  }

  await Review.deleteMany({ college: id });

  return sendResponse(res, 200, 'College and associated reviews deleted successfully', null);
});

module.exports = {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
};
