const express = require('express');
const tourController = require('./../controllers/tourController');
const {
  getTopTours,
  getAllTours,
  insertTour,
  getTour,
  deleteTour,
  updateTour,
  getTourStats,
  getMonthlyPlan
} = tourController;
const authController = require('./../controllers/authController');
const { protect } = authController;

const router = express.Router();

router.route('/top-tours').get(getTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/')
  .get(getAllTours)
  .post(insertTour);

router
  .route('/:id')
  .get(getTour)
  .delete(deleteTour)
  .patch(updateTour);

module.exports = router;
