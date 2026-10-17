const AppError = require('../utils/appError');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message.replace(/['"]/g, ''));
      return next(new AppError(errorMessages.join(', '), 400));
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
