const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({path: './config.env'})

const DB= process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB ,    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(()=>{console.log("DB connection successful!")});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json` , 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json` , 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json` , 'utf-8'));

const importData = async ()=> {
    try{
        await User.create(users, {validateBeforeSave: false});
        await Tour.create(tours);
        await Review.create(reviews);
        console.log('data loaded successfully');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

//DELETE ALL DATA FROM DB
const deleteData = async ()=> {
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('data deleted successfully');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

if (process.argv[2]==='--import'){
    importData();
}
else if (process.argv[2]==='--delete') {
    deleteData();
}

 