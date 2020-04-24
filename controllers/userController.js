const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const User = require('./../models/userModel');

const AppError = require('./../utils/apperror');
const catchAsync = require('./../utils/catchasync');
const handlerFactory = require('./handlerFactory');

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, './public/img/users/');
//   },
//   filename: function(req, file, cb) {
//     const imageFormat = file.mimetype.split('/')[1];
//     const fileName = `user-${req.user.id}-${Date.now()}.${imageFormat}`;
//     cb(null, fileName);
//   }
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // File format
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not an image! please upload only image format', 400),
      false
    );
  }
};

// File size
const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1000000
  }
});

exports.updatePhoto = (req, res, next) => {
  const upload = uploadConfig.single('photo');

  // console.log(req.file);

  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_FILE_SIZE')
        return next(
          new AppError('File too large, size should be less than 1 Mb', 400)
        );
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.send(err);
    }
    // Everything went fine.
    return next();
  });
};

exports.resizePhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  return next();
};

exports.deleteFile = (req, res, next) => {
  // delete old image when update the photo
  if (req.file) {
    const filePath = path.join(
      __dirname,
      '..',
      'public',
      'img',
      'users',
      `${req.user.photo}`
    );
    // check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, err => {
        if (err) return next(new AppError('Something went wrong', 400));
      });
      return next();
    }
  }

  return next();
};

const filterObj = (obj, ...allowed) => {
  const newObj = {};
  // get key from object
  Object.keys(obj).forEach(key => {
    // if allowed includes key, create new field {property: value}
    if (allowed.includes(key)) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

exports.getAllUsers = handlerFactory.getAll(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file, req.body);

  // 1) create error if POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(`You have no access to update password in this route`)
    );
  }

  // 2) update user document
  const updateObject = filterObj(req.body, 'name', 'email');
  if (req.file) updateObject.photo = req.file.filename;

  const updateCurrentUser = await User.findByIdAndUpdate(
    req.user.id,
    updateObject,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    user: updateCurrentUser
  });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false
  });

  res.status(200).json({
    status: 'success',
    data: null
  });
});

exports.getUser = handlerFactory.getOne(User);

exports.updateUser = handlerFactory.updateOne(User);

exports.deleteUser = handlerFactory.deleteOne(User);
