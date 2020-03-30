const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [8, 'A tour name at least has to be 8 characters'],
      maxlength: [
        50,
        'A tour name must have less than or equal to 50 characters'
      ],
      validate: {
        validator: function(val) {
          return /^[A-Za-z\s]+$/.test(val);
        },
        message: 'A tour name must alphabet only'
      }
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult'
      }
    },
    price: {
      type: Number,
      required: [true, 'A price must have a value']
    },
    ratingsAverage: {
      type: Number,
      default: 5,
      min: [1.0, 'A tour ratings must have more than or equals to 1 stars'],
      max: [5.0, 'A tour ratings must have less than or equals to 5 stars']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'A discount ({VALUE}) should be less than price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, ' A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// virtual properties
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Document Middleware: run before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre('aggregate', function(next) {
  // object ke array
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } }
  });
  // eslint-disable-next-line no-console
  console.log(this.pipeline());

  next();
});

// tourSchema.pre(/^find/, function(next) {
//   this.select('-name -duration');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
