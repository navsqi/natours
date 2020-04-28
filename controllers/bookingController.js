const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchasync');
const handlerFactory = require('./handlerFactory');
const AppError = require('./../utils/apperror');

exports.checkoutSession = catchAsync(async (req, res, next) => {
  // 1) Get currently booking tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour._id}&user=${
      req.user._id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: tour.name,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  console.log(req.query);
  let { tour, user, price } = req.query;

  price = Number(price);

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  return res.redirect(req.originalUrl.split('?')[0]);
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({ user: req.user.id });

  const toursId = booking.map(bookings => bookings.tour);

  const tours = await Tour.find({ _id: { $in: toursId } });

  res.render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.getBooking = handlerFactory.getOne(Booking);

exports.updateBooking = handlerFactory.updateOne(Booking);

exports.deleteBooking = handlerFactory.deleteOne(Booking);

exports.getAllBooking = handlerFactory.getAll(Booking);
