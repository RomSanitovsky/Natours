const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true , 'user must have a name'],
    },
    email : {
        type: String,
        require: [true , 'user must have an email'],
        unique: [true],
        lowercase: [true],
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo : {
        type: String
    },
    password: {
        type: String,
        required : [true , 'Please provide a password'],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required : [true , 'Please confirm your password'],
        validate: {
            //this only works on creat OR save!!!
            validator: function(el){
                return el===this.password;  
            },
            message : 'Passwords are not the same'
        }
    }
});

userSchema.pre('save', async function(next) {
    //only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    //hash the password with a cost of 12
    this.password =  await bcrypt.hash(this.password, 12)

    //delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model('User' , userSchema);
module.exports = User; 