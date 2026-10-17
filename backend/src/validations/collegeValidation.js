const Joi = require('joi');

const createCollegeSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    'string.empty': 'College name is required',
    'string.min': 'College name must be at least 2 characters',
  }),
  location: Joi.string().required().messages({
    'string.empty': 'Location is required',
  }),
  city: Joi.string().required().messages({
    'string.empty': 'City is required',
  }),
  state: Joi.string().allow('', null),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
  }),
  website: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Website must be a valid URI',
  }),
  establishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).allow(null),
});

const updateCollegeSchema = Joi.object({
  name: Joi.string().min(2).max(150),
  location: Joi.string(),
  city: Joi.string(),
  state: Joi.string().allow('', null),
  description: Joi.string().min(10).max(2000),
  website: Joi.string().uri().allow('', null),
  establishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).allow(null),
}).min(1);

const collegeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  sort: Joi.string().valid('rating_desc', 'rating_asc', 'newest', 'name_asc').default('rating_desc'),
});

module.exports = {
  createCollegeSchema,
  updateCollegeSchema,
  collegeQuerySchema,
};
