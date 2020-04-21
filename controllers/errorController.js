const AppError = require('./../utils/apperror');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  // Handling devlopment error
  if (process.env.NODE_ENV === 'development') {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        errors: err,
        message: err.message,
        stack: err.stack
      });
    }

    return res.status(err.statusCode).render('error', {
      message: err.message,
      title: err.message
    });
  }

  // Handling invalid database IDs
  if (err.name === 'CastError') {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Handling duplicate value
  if (err.code == 11000) {
    // get the message between quotes
    const msg = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);

    err = new AppError(
      `Duplicate field value: ${msg[0].split('"').join('')}`,
      400
    );
  }

  // Handling validation
  if (err.name === 'ValidationError') {
    // get values from object
    const errorsMsg = Object.values(err.errors).map(el => el.message);
    err = new AppError(errorsMsg.join(', '), 400);
  }

  // Handling invalid Bearer token
  if (err.name === 'JsonWebTokenError') {
    err = new AppError(`Invalid token, please try again`, 401);
  }

  // Handling token is expired
  if (err.name === 'TokenExpiredError') {
    err = new AppError(`Token has expired, please login again.`, 401);
  }

  // Handling non-operational error
  if (!err.isOperational) {
    err = new AppError(`Something went wrong`, 500);
  }

  // Handling production error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  return res.status(err.statusCode).render('error', {
    message: err.message,
    title: err.message
  });
};
