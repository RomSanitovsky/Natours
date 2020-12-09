const crypto = require("crypto");
const {promisify } = require("util");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id: id}, process.env.JWT_SECRET , {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};



const createSendToken = (user,statusCode , res) => {
    const token = signToken(user._id);
    const cookieOptions ={
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true  
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure=true;
    res.cookie('jwt', token, cookieOptions);
    
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    }); 
}

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser,201,res);
});

exports.login = catchAsync(async(req,res,next)=> {
    const {email, password} = req.body;

    //check if email and password exist
    if (!email || !password) {
        return next(new AppError('please provide email and password!', 400));
    }
    //check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    

    if (!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect email or password!',401));
    }

    //if everything is ok send token to client
    createSendToken(user,200,res);
});


exports.protect = catchAsync(async(req,res,next)=>{
    //checking if token is existed
    let token;
    if (req.headers.authorization 
        && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }
        console.log(token);

    if (!token){
        return next(new AppError('you are not logged in! please log in first',401)); 
    }    

    //verification token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET); 
    console.log(decoded);
    //checks if user still exists
    const currentUser = await User.findById(decoded.id);
    if  (!currentUser){
        return next(new AppError('the user belonging to token does no longer exists'));
    }
    //check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again', 401));
    }

    //Grant Access to Protected Route
    console.log(currentUser);
    req.user=currentUser;
    next();
});

exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you do not have permission to perform this action', 403));
        }
        next();
    }
};

exports.forgotPassword = catchAsync(async(req,res,next) =>{
    //Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('there is no user with this email address',404));
    };
    //Generate the random reset tokem 
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    //send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}}`;

    const message = `Forgot your password? submit a PATCH request with your new password and
passwordConfirm to: ${resetURL}. \nIf you didn't forgot your password, please ignore this email`;

    try {
        await sendEmail({
            email : user.email,
            subject : 'Your password reset token (valid for 10 min',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });    
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpired = undefined;
        return next(new AppError('There was an error sending this email. Try again later!'));
    }

});
exports.resetPassword = catchAsync(async (req,res,next) =>{
    // 1) get user based on the token
    const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpired: {$gte: Date.now()}
    });
    // 2) if token has not expired , and there is user, set the new password
    if (!user){
        return next(new AppError('token is invalid or has expired',400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    await user.save();
    // 3) update changedPasswordAt property for the user

    // 4) log the user in , send jwt 
    createSendToken(user,200,res);
});

exports.updatePassword = catchAsync(async(req,res,next)=>{     
    //get user from collection
    const user = await User.findOne({_id:req.user.id}).select('+password'); 
    if (!user){
        return next(new AppError('you are not logged in',401));
    }

    //check if current password is correct
    if (!(await user.correctPassword(req.body.correntpassword,user.password))) {
        return next(new AppError('your corrent password is wrong!',401));
    }
    //if pass ic correct - update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //user update will not work!
    //log user in , send JWT
    createSendToken(user,200,res);
});