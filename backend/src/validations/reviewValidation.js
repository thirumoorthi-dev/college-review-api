const Joi = require('joi');

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
  comment: Joi.string().min(5).max(1000).required().messages({
    'string.empty': 'Review comment is required',
    'string.min': 'Review comment must be at least 5 characters',
    'string.max': 'Review comment cannot exceed 1000 characters',
  }),
  title: Joi.string().max(120).allow('', null),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().min(5).max(1000),
  title: Joi.string().max(120).allow('', null),
}).min(1);

const reviewQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string().valid('newest', 'oldest', 'rating_desc', 'rating_asc').default('newest'),
  rating: Joi.number().integer().min(1).max(5),
  search: Joi.string().allow('', null),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
};
