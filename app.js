
const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routs/tourRoutes');
const userRouter = require('./routs/userRoutes');
const reviewRouter = require('./routs/reviewRoutes');
const viewRouter = require('./routs/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));

// 1) Global Middlewares
// Set Security HTTP headers
app.use(helmet());

console.log(process.env.NODE_ENV);

// Development Logging
if (process.env.NODE_ENV==='development')
{
    app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000,
    message: 'too many request from this IP , please try again in an hour!'
});
app.use('/api', limiter);

/// Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));

// Data sanitization against NoSql 
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent paramater pollution
app.use(hpp({
    whitelist: [
        'duration', 
        'ratingQuantity', 
        'ratingAverage', 
        'difficulty', 
        'maxGroupSize', 
        'price'
    ]
}));



// Test Middleware 
app.use((req,res,next)=>{
    req.requestTime = new Date().toDateString(); 
    console.log(req.headers);
    next();
});


// 3) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*' , (req,res,next)=> {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
});

app.use(GlobalErrorHandler);


// 4) Start Server
module.exports = app;