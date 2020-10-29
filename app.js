const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

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
app.use((req,res,next)=> {
    console.log('hello from the middleware');
    next();
});



// 3) Routes


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


// 4) Start Server
module.exports = app;