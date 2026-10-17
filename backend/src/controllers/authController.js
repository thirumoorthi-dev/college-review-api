const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists', 409));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
  });

  const token = user.generateAuthToken();

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return sendResponse(res, 201, 'User registered successfully', {
    user: userResponse,
    token,
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = user.generateAuthToken();

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return sendResponse(res, 200, 'Logged in successfully', {
    user: userResponse,
    token,
  });
});

const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  return sendResponse(res, 200, 'User profile fetched successfully', {
    user,
  });
});

module.exports = {
  register,
  login,
  getMe,
};
