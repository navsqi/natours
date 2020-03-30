const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');

const signToken = async id => {
  return await jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: '' + 60000 * 60
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // 1) create new user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.changedPasswordAt
  });

  // 2) sign token
  const token = await signToken(newUser.id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // 1) check if email and password are not filled
  if (!req.body.email || !req.body.password) {
    return next(new AppError('Provide your email & password!', 400));
  }

  // 2) get user from database
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  // 3) check if user not found
  if (
    !user ||
    !(await user.comparePassword(req.body.password, user.password))
  ) {
    return next(new AppError('Invalid email or password', 401));
  }

  // 4) if user found, sign token
  const token = await signToken(user._id);

  return res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  // 2) verification token
  const verify = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exist
  const currentUser = await User.findById(verify.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging this token does not exist', 401)
    );
  }

  // 4) check if password not changed after the token was issued
  if (currentUser.changedPasswordAfter(verify.iat)) {
    return next(
      new AppError(`User recently changed password, please log in again`, 401)
    );
  }

  req.user = currentUser;
  next();
});
