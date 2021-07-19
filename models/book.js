const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'uploads/BookCovers'

// Set up schema
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate:{
        type: Date,
        required: true
    },
    pageCount:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName:{
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author' //match the name of model author 
    }
})

// virtual : create the virtual properties
bookSchema.virtual('coverImagePath').get(function(){ //use normal function -> use this
    if(this.coverImageName != null){
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
})

module.exports = mongoose.model('Book', bookSchema)// model name,table
module.exports.coverImageBasePath = coverImageBasePath