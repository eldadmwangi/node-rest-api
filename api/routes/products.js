const express = require('express')
const router = express.Router()
const Product = require('../models/products')
const mongoose =require('mongoose')
const checkAuth = require('../middleware/check-auth')

//multer for file uploads//
//this is description and location of file//
const multer = require('multer')
//configure how the file will be stored//
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads')
    },
    filename:function(req,file,cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})

const fileFilter = (req, file, cb) =>{
    //reject a file ignores file//
    if(file.mimetype ==='image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false)
    }   
}

const upload = multer({
    storage:storage, 
    limits:{
    fileSize:1024 * 1024 * 5
},
fileFilter:fileFilter
})


router.get('/', (req,res,next)=>{
    Product.find()
    .select('name price _id url rating description productImage')
    .exec()
    .then(docs=>{
        const response = {
            count:docs.length,
            products:docs.map(doc=>{
                return {
                    name:doc.name,
                    price:doc.price,
                    _id:doc._id,
                    url:doc.url,
                    rating:doc.rating,
                    description:doc.description,
                    productImage:doc.productImage,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
}) 

router.post('/', checkAuth, upload.single('productImage'), (req,res,next)=>{
    console.log((req.file))
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        description:req.body.description,
        rating:req.body.rating,
        url:req.body.url,
        productImage:req.file.path

    })
    product.save()
    .then(result=>{
        console.log(result)
        res.status(201).json({
            message:'Created product succesfully',
            createdProduct:{
                name:result.name,
                price:result.price,
                _id:result._id,
                description:result.description,
                rating:result.rating,
                request:{
                    type:'GET',
                    url:'http://localhost:3000/products/' + result._id
                }
            }
        })
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
   
})

//get for a single product//
router.get('/:productId', (req,res,next)=>{
    const id =req.params.productId;//
    // const {id} =req.params;
    Product.findById(id)
    .select('name price _id url rating description productImage')
    .exec()
    .then(doc=>{
        console.log('from the database we have',doc)
        if(doc){
            res.status(200).json(doc)
        } else{
            res.status(404).json({
                message:'No valid id found for the provided id'
            })
        }
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
           error:err 
        })
    })
})

router.patch('/:productId', checkAuth, (req,res,next)=>{
    const id = req.params.productId
    const updateOps = {};
    for( const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Product.updateMany({_id:id}, {$set:updateOps})
    .exec()
    .then(result=>{
        console.log(result)
        res.status(200).json({
            message:'product updated',
            request:{
                type:'GET',
                url:'http://localhost:3000/products/' + id
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

router.delete('/:productId',checkAuth, (req,res,next)=>{
    const id= req.params.productId;
    Product.remove({_id:id})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'Product deleted',
            request:{
                type:'POST',
                url:'http://localhost:3000/products/',
                body:{name:'String', price:'Number'}
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


module.exports =router;