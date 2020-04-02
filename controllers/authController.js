const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');
const sendEmail = require('./../utils/email');

const signToken = async id => {
  return await jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: '' + 60000 * 60
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // 1) create new user
  const newUser = await User.create(req.body);

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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You dont have permission to perform this action`)
      );
    }

    return next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) check if user exist by email address
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(`Email does not exist`));
  }

  // 2) Generate & Get token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) send token to email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot password? Submit a PATCH request with your new password and confirmation password to: ${resetURL}. \nIf you didn't forget your password, please ignore this email!'`;
  const subject = `Reset password token (valid for 10 min)`;

  try {
    await sendEmail({
      email: user.email,
      subject,
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token has been sent to your email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save();

    next(
      new AppError(
        `There was an error sending the email. Try again later!`,
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    next(new AppError(`Token is invalid or has expires`, 400));
  }
  // 2) if token has not expired and there is user, set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) sign token
  const token = await signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});
