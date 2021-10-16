const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
//install bcrypt for hashing...//
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const User = require('../models/user')

router.post('/signup', (req,res,next)=>{
    //ensure user emails do not match//
    User.find({email:req.body.email})
    .exec()
    .then(user => {
        if (user.length >=1 ) {
            return res.status(409).json({
                message:"email is already in use"
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err,hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    //create a user with a hash password//
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        userName:req.body.userName,
                        email:req.body.email,
                        password:hash
                    })
                    user
                    .save()
                    .then(result => {
                        console.log(result)
                       res.status(201).json({
                            message:'user created'
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                           error: err 
                        })
                    })
                }
            } )      
        }
    })  
})


//login a user//

router.post('/login', (req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then( user => {
        if (user.length < 1 ) {
            return res.status(401).json({
                message:'Auth failed'
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err,result) =>{
            if(err) {
                return res.status(401).json({
                    message:'Auth failed'
                })
            }
            if (result) {
               const token= jwt.sign({
                    //payload//
                    email:user[0].email,
                    userId:user[0]._id
                },
                //private key//
                process.env.JWT_KEY,
                {
                    expiresIn:"1h"
                }
                //call back here but we define it as a token and call it above and below//
                );
                return res.status(200).json({
                    message:"Auth is successful",
                    token:token
                })
            }
            res.status(401).json({
                message:'Auth failed'
            })
        })
    })
    .catch( err=> {
        console.log(err)
        res.status(500).json({
            error:err
        })
    })

})

//get all users//
router.get('/signup',(req,res,next)=>{
    User.find()
    .select('email password userName')
    .exec()
    .then(docs=>{
        const response ={
            user:docs.map(doc=>{
                return {
                    _id:doc._id,
                    userName:doc.userName,
                    email:doc.email,
                    password:doc.password
                }
            })
        }
        res.status(200).json(response)

    })
})




//delete a user//
router.delete('/:userId', (req,res,next)=>{
    User.remove({_id:req.params.userId})
    .exec()
    .then(result =>{
        console.log(result)
        res.status(200).json({
            message:'user deleted'
        })
    })
    .catch( err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })  
})





         

module.exports= router











