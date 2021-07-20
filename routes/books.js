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
router.get('/new', async (req, res)=>{
    renderNewPage(res, new Book())
}); 

// Create books route
router.post('/', express.urlencoded({limit: '10mb', extended: false}), async (req, res)=>{    
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
        // res.redirect(`books/${newbook.id}`)
        res.redirect('books')
    }catch{
        // No more need
        // if(book.coverImageName != null){ // remove the error image
        //     removeBookCover(book.coverImageName)
        // }
        renderNewPage(res, book, true)
    }
})

//No more need b/c we not save in our computer more
// function removeBookCover(filename){
//     //remove thing we dont want out of the server
//     fs.unlink(path.join(uploadPath, filename), err =>{
//         if(err) console.error(err)
//     })
// }

// convert image to string -> buffer
function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = 'Error creating book'
        res.render('books/new', params)
    }catch{
        res.redirect('/books')
    }
}

module.exports = router;