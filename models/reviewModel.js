const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true,'A review must have text'],
        trim : true,
        maxlength: [400, 'a tour name must have max 400 char length'],
        minlength: [3, 'a tour name must have min 3 char length'],
    },
    rating: {
        type: Number,
        max: 5,
        min : 1
    },
    createdAt: {
        type : Date,
        default: Date.now(),
    },
    user : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required : [true, 'review must belong to a user']
    },
    tour :{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required : [true, 'review must belong to a tour']
    }

},
 {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

reviewSchema.index({tour: 1 , user: 1} , {unique: true});

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'user',
    //     select: 'name photo -_id'
    // }).populate({
    //     path: 'tour',
    //     select: 'name'
    // });
    this.populate({
        path: 'user',
        select: 'name photo -_id'
    });

    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
           $group: {
            _id: '$tour',
             nRating: {$sum: 1},
             avgRating: {$avg: '$rating'}
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Tour').findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        
        });
    }
    else {
        await mongoose.model('Tour').findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};
reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/ , async function(next) {
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/ , async function(next) {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});


const Review = mongoose.model('Review' , reviewSchema);
module.exports = Review; 