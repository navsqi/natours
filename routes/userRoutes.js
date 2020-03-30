const express = require('express');
const userController = require('./../controllers/userController');
const {
  getAllUsers,
  insertUser,
  getUser,
  deleteUser,
  updateUser
} = userController;
const authController = require('./../controllers/authController');
const { signup, login, protect } = authController;

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

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
