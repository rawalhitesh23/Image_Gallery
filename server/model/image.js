const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    address : String,
    register_date: {
        type: Date,
        default: new Date()
    },
    address_id : {
        type: String,
        unique: true
    }  
})

const Image = mongoose.model('image', ImageSchema)
module.exports = Image