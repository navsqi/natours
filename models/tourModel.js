const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
const Review = require('./reviewModel');

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
      max: [5.0, 'A tour ratings must have less than or equals to 5 stars'],
      set: val => Math.round(val * 10) / 10
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
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        description: String,
        coordinates: [Number],
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtual properties
tourSchema.virtual('durationWeeks').get(function() {
  if (this.duration) {
    return this.duration / 7;
  }
  // eslint-disable-next-line no-return-assign
  return (this.durationWeeks = undefined);
});

// virtual Reviews
tourSchema.virtual('reviews', {
  // reference to Review Model
  ref: 'Review',
  // field in reference model
  localField: '_id', // find review where 'localField' (in Tour Model)
  foreignField: 'tour' // is equal to 'foreignField' (in Review Model)
});

// Delete reviews if the tour is deleting
tourSchema.pre('findOneAndDelete', async function(next) {
  const tour = await this.findOne();

  await Review.deleteMany({ tour: tour._id });
  next();
});

// Document Middleware: run before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Change user guide id into detail of user
// tourSchema.pre('save', async function(next) {
//   const fetchGuides = this.guides.map(async id => await User.findById(id));
//   const guides = await Promise.all(fetchGuides);

//   this.guides = guides;

//   next();
// });

// get tour guide from user id, populate is like a JOIN in SQL
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -password'
  });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// tourSchema.pre('aggregate', function(next) {
//   // object ke array
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } }
//   });
//   // eslint-disable-next-line no-console
//   console.log(this.pipeline());

//   next();
// });

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
