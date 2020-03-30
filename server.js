require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(con => {
    console.log('DB connection successful');
  });

const server = app.listen(3000, () =>
  console.log('Server is running on port 3000')
);

process.on('unhandledRejection', err => {
  console.log(err.message);

  server.close(() => {
    process.exit(1);
  });
});
