const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');
const handlerFactory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  if (!req.body.tour) req.body.tour = req.params.tourId;

  next();
};

exports.createReview = handlerFactory.createOne(Review);

exports.getAllReviews = handlerFactory.getAll(Review);

exports.getReview = handlerFactory.getOne(Review);

exports.deleteReview = handlerFactory.deleteOne(Review);

exports.updateReview = handlerFactory.updateOne(Review);
