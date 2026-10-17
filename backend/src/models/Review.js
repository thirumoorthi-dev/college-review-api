const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'Review must belong to a college'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author'],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ college: 1, user: 1 }, { unique: true });
reviewSchema.index({ comment: 'text', title: 'text' });

reviewSchema.statics.calculateAverageRating = async function (collegeId) {
  const stats = await this.aggregate([
    {
      $match: { college: new mongoose.Types.ObjectId(collegeId) },
    },
    {
      $group: {
        _id: '$college',
        reviewCount: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('College').findByIdAndUpdate(collegeId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await mongoose.model('College').findByIdAndUpdate(collegeId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.college);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.college);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
