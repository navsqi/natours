const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function(next) {
  // check if password is not modified or new document
  if (!this.isModified('password') || this.isNew) return next();

  // set password change at - 1000 (in order to passwordChangeAt is less than token expires)
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.comparePassword = async (inputPassword, currentPassword) => {
  return await bcrypt.compare(inputPassword, currentPassword);
};

userSchema.methods.createPasswordResetToken = function() {
  // get random string
  const resetToken = crypto.randomBytes(32).toString('hex');

  // get token and hash it with sha256
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log(resetToken, this.passwordResetToken, this.passwordResetExpires);

  return resetToken;
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  // to check if password not changed after the token was issued
  if (this.passwordChangedAt) {
    const passwordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return passwordChangedAt > JWTTimestamp; // true bcs password change after token was issued
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
