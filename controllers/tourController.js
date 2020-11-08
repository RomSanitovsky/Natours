const { models, Query } = require('mongoose');

const Tour = require('../models/tourModel');





exports.getAllTours = async (req,res)=>{
    try{
    //BUILD QUERY

    // 1A) FILTERING
    const queryObj = {...req.query};
    const excludedFields = ['page', 'sort' , 'limit' , 'fields'];
    excludedFields.forEach(element => {
        delete queryObj[element];
    });     
    // 1B) ADVANCED FILTERING
    let queryStr= JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g , match => `$${match}` );
    console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr));
    // 2) Sorting
    if (req.query.sort){
        
        const sortBy = req.query.sort.replace(',',' ');
        query = query.sort(sortBy);
    } else {
        query.sort('-createdAt');
    }
    
    // 3) Field Limiting
    if (req.query.fields){
        
        const fields = req.query.fields.replace(',',' ');
        query = query.select(fields);
    } else {
        query.select('-__v');
    }


    //EXECUTE QUERY
    const tours = await query;
 
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data:{
            tours
        }
        
    });
    }
    catch(err) {
        res.status(404).json({
            status: 'fail',
            messege: err
        })
    }
}

exports.getTour = async (req,res)=>{
    try{
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
        status: 'success',
        data:{
            tour
        }
         });
    }
    catch (err)
    {
        res.status(200).json({
            status: 'success',
            message: err  
             });
    }
}

exports.createTour = async (req,res)=>{
    
    try{
        const newTour = await Tour.create(req.body);
        res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
            }
        }); 
    }
    catch(err)
    {
        res.status(400).json({
            status: 'failed',
            message: err
        });
    }
};

exports.updateTour = async (req,res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id , req.body , {
            new : true,
            runValidators : true
            
        });
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });
    }

    catch (err)
    {
        res.status(404).json({
            status: 'failed',
            message: err
        });
    }

   
};

exports.deleteTour = async (req,res)=>{
    try{  
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: "success",
    });
}
catch (err)
{
    res.status(404).json({
        status: 'failed',
        message: err
    });
}
    

};