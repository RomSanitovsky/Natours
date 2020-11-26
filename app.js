const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routs/tourRoutes');
const userRouter = require('./routs/userRoutes');

const app = express();

console.log(process.env.NODE_ENV);
// 1) Middlewares
if (process.env.NODE_ENV==='development')
{
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`))
app.use((req,res,next)=>{
    req.requestTime = new Date().toDateString(); 
    console.log(req.headers);
    next();
});


// 3) Routes


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


app.all('*' , (req,res,next)=> {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
});

app.use(GlobalErrorHandler);


// 4) Start Server
module.exports = app;