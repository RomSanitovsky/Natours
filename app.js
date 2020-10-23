const express = require('express');
const app = express();

app.get('/',(req,res)=>{
    res.status(200).send('hello from server');
}
)


const port=3000;
app.listen(port , ()=>{
    console.log(`app running on port ${port}...`);
});