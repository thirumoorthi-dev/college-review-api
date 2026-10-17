const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Authentication required. Please provide a valid Bearer token.', 401)
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecret_jwt_key_college_review_system_2026_production'
    );
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token', 401));
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists', 401));
  }

  req.user = currentUser;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
