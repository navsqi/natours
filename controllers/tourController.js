const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchasync');
const handlerFactory = require('./handlerFactory');

exports.getTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage, summary, difficulty';
  next();
};

exports.getAllTours = handlerFactory.getAll(Tour);

exports.getTour = handlerFactory.getOne(Tour, {
  path: 'reviews',
  select: 'rating review -tour'
});

exports.updateTour = handlerFactory.updateOne(Tour);

exports.deleteTour = handlerFactory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   await Tour.findByIdAndDelete(req.params.id);

//   return res.status(200).json({
//     status: 'success',
//     message: 'Data has been successfully deleted.'
//   });
// });

exports.createTour = handlerFactory.createOne(Tour);

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
