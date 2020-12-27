
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');


const filterObj = (obj , ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
}





exports.updateMe = catchAsync(async(req,res,next)=>
{
    //1) create error if user posts password data
    if (req.body.password) {
        return next(new AppError('this route is not for password updates. please use /updateMyPassword', 400));
    }

    //2) filter out unwanted field name that are not allowed to be updated
    const filterBody = filterObj(req.body, 'name', 'email');
    //3) update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    }); 
    
    res.status(200).json({
        status: 'success',
        user : updatedUser
    });
});

exports.deleteMe = catchAsync(async(req,res,next) => {
    await User.findByIdAndUpdate(req.user.id , {active: false});

    res.status(204).json({
        status : 'success',
        data: null

    });
});

exports.createUser = (req,res)=>{
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    });
};


exports.getAllUsers =  factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do not update passwords like this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
