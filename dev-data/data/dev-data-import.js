require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const app = require('./../../app');

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

const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('Data has been imported successfully');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data has been deleted successfully');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

if (process.argv[2] == '--import') {
  importData();
} else {
  deleteData();
}

app.listen(3000, () => console.log('Server is running on port 3000'));
