const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
    names:{
        type:String,
        minLength:2,
        unique:true,
    },
    category:{
        type:String,
        minLenghth:2,
        unique:true,
    },
    added_date:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        enum:['active','notActive'],
        default:"active"
    },
})


const subcategory = new mongoose.model("subcategorys",subcategorySchema);
module.exports = subcategory;