const path = require('path');

exports.filePath = path.join(
  __dirname,
  '..',
  'public',
  'img',
  'users',
  `${req.user.photo}`
);
