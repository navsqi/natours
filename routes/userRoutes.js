const express = require('express');
const userController = require('./../controllers/userController');
const {
  getAllUsers,
  updateMe,
  deactivateMe,
  insertUser,
  getUser,
  deleteUser,
  updateUser
} = userController;
const authController = require('./../controllers/authController');
const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword
} = authController;

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword/', protect, updatePassword);
router.patch('/updateMe/', protect, updateMe);
router.delete('/deactivateMe/', protect, deactivateMe);

router
  .route('/')
  .get(protect, getAllUsers)
  .post(insertUser);

router
  .route('/:id')
  .get(getUser)
  .delete(deleteUser)
  .patch(updateUser);

module.exports = router;
