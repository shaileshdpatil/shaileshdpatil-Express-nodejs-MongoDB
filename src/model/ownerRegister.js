const mongoose = require("mongoose");
const ownerRegisterSchema = new mongoose.Schema({
    packageName: {
        type: String
    },
    names: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: true
    },
    phone: {
        type: Number,
        unique: true
    },
    password: {
        type: String,
    },
    added_date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: false
    },
})


const ownerRegister = new mongoose.model("ownerRegister", ownerRegisterSchema);
module.exports = ownerRegister;