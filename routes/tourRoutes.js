const express = require('express');
const tourController = require('./../controllers/tourController');
const {
  updateImages,
  resizeImages,
  getTopTours,
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = tourController;
const authController = require('./../controllers/authController');
const { protect, restrictTo } = authController;

const router = express.Router();
const reviewRoutes = require('./../routes/reviewRoutes');

// Middleware review
router.use('/:tourId/reviews', reviewRoutes);

router.route('/top-tours').get(getTopTours, getAllTours);
router
  .route('/stats')
  .get(protect, restrictTo('admin', 'lead-guide'), getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// /tours-within/250/center/34.082669, -118.281201/unit/mi
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour, protect)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    updateImages,
    resizeImages,
    updateTour
  );

module.exports = router;
