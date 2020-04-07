const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apifeatures');
const AppError = require('./../utils/apperror');
const catchAsync = require('./../utils/catchasync');

const filterObj = (obj, ...allowed) => {
  const newObj = {};
  // get key from object
  Object.keys(obj).forEach(key => {
    // if allowed includes key, create new field {property: value}
    if (allowed.includes(key)) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Execute Query
  const features = new APIFeatures(User, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  // Response Query
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(`You have no access to update password in this route`)
    );
  }

  // 2) update user document
  const updateObject = filterObj(req.body, 'name', 'email');

  const updateCurrentUser = await User.findByIdAndUpdate(
    req.user.id,
    updateObject,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    user: updateCurrentUser
  });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
  const currentUser = await User.findByIdAndUpdate(req.user._id, {
    active: false
  });

  res.status(200).json({
    status: 'success',
    data: null
  });
});

exports.getUser = (req, res) => {
  return res.status(200).json({
    status: 'success'
  });
};

exports.updateUser = (req, res) => {
  return res.status(200).json({
    status: 'success'
  });
};

exports.deleteUser = (req, res) => {
  return res.status(200).json({
    status: 'success'
  });
};

exports.insertUser = (req, res) => {
  return res.status(200).json({
    status: 'success'
  });
};
