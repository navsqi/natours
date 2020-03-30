const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeatures');
const catchAsync = require('./../utils/catchasync');

exports.getTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage, summary, difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // Execute Query
  const features = new APIFeatures(Tour, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // Response Query
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  return res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  return res.status(200).json({
    status: 'success',
    message: 'Data has been successfully deleted.'
  });
});

exports.insertTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gt: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        amount: { $sum: 1 },
        name: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $sort: {
        month: 1
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $limit: 12
    }
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
