const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.checkoutSession
);

router.get('/', bookingController.getAllBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
