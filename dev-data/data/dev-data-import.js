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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.insertMany(tours);
    console.log('Data has been imported successfully');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
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
