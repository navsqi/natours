const catchAsync = require('./../utils/catchasync');
const AppError = require('./../utils/apperror');
const APIFeatures = require('./../utils/apifeatures');

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newTour = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        data: newTour
      }
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Data has been successfully deleted.'
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc)
      return next(
        new AppError(`No document found with id ${req.params.id}`, 404)
      );

    return res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.getOne = (Model, populateOpt) =>
  catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populateOpt) query = query.populate(populateOpt);

    const doc = await query;

    return res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // review on tour handler
    let tourId = {};
    if (req.params.tourId) tourId = { tour: req.params.tourId };

    // Execute Query
    const features = new APIFeatures(Model.find(tourId), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain();
    const doc = await features.query;

    // Response Query
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc
    });
  });
