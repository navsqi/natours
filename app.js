const express = require('express');
const morgan = require('morgan');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

const AppError = require('./utils/apperror');
const globalErrorHandler = require('./controllers/errorController');

// Router
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use('*', (req, res, next) => {
  //console.log(req.headers);
  next();
});

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find route ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
