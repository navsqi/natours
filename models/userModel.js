const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Email is required'],
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password is not valid'],
    minlength: 8,
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: 'Passwords are not match'
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.comparePassword = async (inputPassword, currentPassword) => {
  return await bcrypt.compare(inputPassword, currentPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  // to check if password not changed after the token was issued
  if (this.passwordChangedAt) {
    const passwordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(passwordChangedAt, JWTTimestamp);
    return passwordChangedAt > JWTTimestamp; // true bcs password change after token was issued
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
