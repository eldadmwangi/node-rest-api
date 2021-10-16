const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser=require('body-parser')
const mongoose = require('mongoose');
 

const productRoutes = require('./api/routes/products')
const ordersRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/user')

mongoose.connect('mongodb+srv://eldad:'+ process.env.MONGO_ATLAS_PW + 
'@node-rest-shop.zqidb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
);

//remove deprecation warning//
mongoose.Promise =global.Promise 

app.use(morgan('dev'));
//esure all routes going to uploads are captured//
app.use('/uploads',express.static('uploads'))
//body parsers..//
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//Handling cross-origin errors..//
// app.use((req,res,next)=>{
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Origin',"Origin,X-Requested-With,Content-Type,Accept,Authorization")
//     if(req.method ==='OPTIONS') {
//         res.header('Access-Control-Allow-Methods','PUT,GET,PATCH,POST,DELETE')
//         return res.status(200).json({})
//       }
// }); 


//set up a middleware function//
app.use('/products',productRoutes); 
app.use('/orders',ordersRoutes);
app.use('/user',userRoutes);


//routes that handle requests//
app.use((req,res,next)=>{
    const error = new Error('Not found')
    error.status=404;
    next(error)
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message:error.message
        }
    })
})

module.exports = app;