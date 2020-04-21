const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.render('overview', {
    title: 'Tours Overview',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'rating review -tour'
  });

  if (!tour) return next(new AppError('Page not found!', 404));

  res.render('tour', {
    title: tour.name,
    tour
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.render('login', {
    title: 'Login'
  });
});
