const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { errorResponse, successResponse } = require('../utils/response');

exports.register = async (req, res, next) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'member',
    });

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const passwordMatch = await user.isPasswordMatch(password);
    if (!passwordMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    return next(error);
  }
};
