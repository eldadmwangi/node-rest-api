const express = require('express') 
const router = express.Router()
const mongoose = require('mongoose')
const Order = require('../models/orders')
const Product = require('../models/products')
const checkAuth = require('../middleware/check-auth')

router.get('/', checkAuth, (req,res,next)=>{
   Order.find()
   .select('product quantity _id')
   .populate('product')
   .exec()
   .then(docs=>{
       res.status(201).json({
        count:docs.length,
        orders:docs.map(doc=>{
         return {
             _id: doc._id,
             product:doc.product,
             quantity:doc.quantity,
             request:{
                 type:'GET',
                 url:"http://localhost:3000/orders/" + doc._id
             }
         }
        })
       })   
   })
   .catch(err=>{
       console.log(err)
       res.status(500).json({
           error:err
       })
   })
})
//creating a new order//
router.post('/', checkAuth, (req,res,next)=>{
    // only create an order for products that exist//
    Product.findById(req.body.productId)
    .then(product=>{
        if(!product){
            return res.status(404).json({
                message:'Product Not Found'
            })
        }
        const order = new Order ({
            _id:mongoose.Types.ObjectId(),
            quantity:req.body.quantity,
            product:req.body.productId
        })
      return  order
        .save()
        .then(result=>{
            console.log(result)
            res.status(201).json({
                message:'order stored',
                createdOrder:{
                    _id:result._id,
                    product:result.product,
                    quantity:result.quantity 
                },
                request:{
                    type:'GET',
                    url:'http://localhost:3000/orders' + result._id
                },
            })
        })
        .catch(err=>{
            console.log(err)
            res.status(500).json({
                error:err
            })
        }) 
    })
})

//updating an order//
router.patch('/', checkAuth, (req,res,next)=>{
    res.status(200).json({
        message:'order has been updated'
    })
}) 
router.delete('/',(req,res,next)=>{
    res.status(200).json({
        message:'order has been deleted'
    })
})

router.get('/:orderId', (req,res,next)=>{
   Order.findById(req.params.orderId)
   .populate('product')
   .exec()
   .then(order=>{
       res.status(200).json({
         order:order,
         request:{
             type:'GET',
             url:'http://localhost:3000/orders'
         }  
       })
   })
   .catch(err=>{
      console.log(err)
      res.status(500).json({
          error:err
      }) 
   })
})

// router.get('/:orderName', (req,res,next)=>{
//     const name = req.params.orderName;
//     if (name ==='samsung'){
//         res.status(200).json({
//             message:'you have fetched an order with an samsung '
//         })
//     }
// })

router.delete('/:orderId', checkAuth, (req,res,next)=>{
    Order.remove({_id:req.params.orderId})
    .exec()
    .then(result =>{
        console.log(result)
        res.status(200).json({
            message:'Order has been deleted',
            request:{
                type:'POST',
             url:'http://localhost:3000/orders',
             body:{ productId: 'ID', quantity:'Number'}
            }
        })
    })
    .catch()
})

module.exports = router