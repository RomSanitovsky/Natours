const express = require('express');
const app = express();

app.get('/',(req,res)=>{
    res.status(200).json({Messege : 'wow' , mode : 2});
}
);

app.post('/',(req,res)=>{
    res.send('this is post');
}
);


const port=3000;
app.listen(port , ()=>{
    console.log(`app running on port ${port}...`);
});