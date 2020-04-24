const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
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

exports.getAccount = (req, res) => {
  res.render('account', {
    title: 'Account Settings'
  });
};

exports.updateUserData = catchAsync(async (req, res) => {
  const newUserData = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  return res.redirect('/me');
});
