const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchasync');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.render('overview', {
    title: 'Tours Overview',
    tours
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'rating review -tour'
  });

  res.render('tour', {
    title: tour.name,
    tour
  });
});
