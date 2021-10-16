const mongoose = require('mongoose')
//create a product schema of how it will look in the database//

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{type:String, required:true},
    price:{type:Number, required:true},
    description:String,
    rating:String,
    url:String,
    productImage:{type:String}
})

module.exports = mongoose.model('Product',productSchema);