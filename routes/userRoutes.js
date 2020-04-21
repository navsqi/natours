const express = require('express');
const userController = require('./../controllers/userController');
const {
  getAllUsers,
  getMe,
  updateMe,
  deactivateMe,
  getUser,
  deleteUser,
  updateUser
} = userController;
const authController = require('./../controllers/authController');
const {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword
} = authController;

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Middleware Protect
router.use(protect);

router.get('/me', getMe, getUser);

router.patch('/updatePassword/', updatePassword);
router.patch('/updateMe/', updateMe);
router.delete('/deactivateMe/', deactivateMe);

// Middleware admin only
router.use(restrictTo('admin'));

router.route('/').get(protect, restrictTo('admin'), getAllUsers);

router
  .route('/:id')
  .get(getUser)
  .delete(deleteUser)
  .patch(updateUser);

module.exports = router;
