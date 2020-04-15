const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// set security HTTP headers
app.use(helmet());

// to check if program running in production or development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser, reading data from body into req.body
app.use(express.json());

// serve static files
app.use(express.static(`${__dirname}/public`));

// require global error handler
const AppError = require('./utils/apperror');
const globalErrorHandler = require('./controllers/errorController');

// Router
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// limiter option for rate limit
const limiter = rateLimit({
  max: 100,
  windowsMs: 20 * 60 * 1000,
  message:
    'Too many accounts created from this IP, please try again after an hour'
});

// Data sanitization for NoSQL query injection
app.use(mongoSanitize());

// Data sanitization for XSS
app.use(xss());

// http parameter pollution
app.use(hpp({ whitelist: ['duration', 'price', 'difficulty'] }));

// rate limit middleware
app.use('/api', limiter);

// test middleware
app.use('*', (req, res, next) => {
  //console.log(req.headers);
  next();
});

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find route ${req.originalUrl}`, 404));
});

// global error handler middleware
app.use(globalErrorHandler);

module.exports = app;
