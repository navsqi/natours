const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apifeatures');
const catchAsync = require('./../utils/catchasync');

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
