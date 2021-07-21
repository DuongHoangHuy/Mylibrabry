const express = require('express');
const router = express.Router();
// const fs = require('fs') // library for not saving image when gettign error
// const path = require('path') // library for join path
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image.gif']
// const upload = multer({
//     dest: uploadPath,//tell where file go to
//     fileFilter: (req, file, callback)=>{
//         callback(null, imageMimeTypes.includes(file.mimetype)) // true: accecpted
//     }
// })

// All book route
router.get('/', async (req, res)=>{
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title,'i')) // 'i' not care A or a
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore)// less than or equal
    } // lte(thu bi so sanh, thu so sanh)
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)// less than or equal
    } 
    try{
        const books = await query.exec()
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
    }
});

// New book
router.get('/new', (req, res)=>{
    renderNewPage(res, new Book())
}); 

// Create books route
router.post('/', async (req, res)=>{    
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),//publishDate is string 
        pageCount: req.body.pageCount,        
        description: req.body.description
    })
    saveCover(book, req.body.cover)

    try{
        const newbook = await book.save()
        res.redirect(`books/${newbook.id}`)
    }catch{
        // No more need
        // if(book.coverImageName != null){ // remove the error image
        //     removeBookCover(book.coverImageName)
        // }
        renderNewPage(res, book, true)
    }
})
// Show books 
router.get('/:id', async (req, res)=>{
    try{
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show',{book: book})
    }catch{
        res.redirect('/')
    }
})

// Edit books
router.get('/:id/edit', async (req, res)=>{
    try{ 
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    }catch{
        res.redirect('/')
    }
}); 

// Show books 
router.get('/:id', async (req, res)=>{
    try{
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show',{book: book})
    }catch{
        res.redirect('/')
    }
})

// Update books route
router.put('/:id', async (req, res)=>{    
    let book
    try{
        book  = await Book.findById(req.params.id)
        book.title= req.body.title,
        book.author= req.body.author,
        book.publishDate= new Date(req.body.publishDate),//publishDate is string 
        book.pageCount= req.body.pageCount,        
        book.description= req.body.description
        if(req.body.cover != null && req.body.cover != ''){
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    }catch{
        console.log(req.body.publishDate)
        if(book != null){// book found but wrong in edit
            renderEditPage(res, book, true)
        }else{
            redirect('/')
        }
        
    }
})

//Delete book
router.delete('/:id', async(req, res)=>{
    let book
    try{
        book  = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    }catch{
        if(book != null){
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove the book'
            })
        }else{
            res.redirect('/')
        }
    }
})

// convert image to string -> buffer
function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = `Error ${form}ing book`
        res.render(`books/${form}`, params)
    }catch{
        res.redirect('/books')
    }
}

async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError)
}


module.exports = router;