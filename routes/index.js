const express = require('express');
const router = express.Router();
const Book = require('../models/book')
// this root is port 3000 
router.get('/', async (req, res)=>{
    let books
    try{
        books = await Book.find().sort({createAt: -1}).limit(10).exec()
    }catch{
        books = []
    }   
    res.render('index', {books: books})  
});     

module.exports = router;