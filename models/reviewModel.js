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

const Review = mongoose.model('Review' , reviewSchema);
module.exports = Review; 