if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config(); //import .env
}

// Set up
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');


const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');


app.set('view engine','ejs');//use ejs as view engine
app.set('views', __dirname+'/views');// where our views come from
app.set('layout', 'layouts/layout');
app.use(expressLayouts);// use this layout
app.use(express.static('public'));// set up public file where to be
// set up

//-----------------work-----------------------
app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

//-----------------work-----------------------

const mongoose = require('mongoose'); // use mongoose
mongoose.connect(process.env.DATABASE_URL,{useUnifiedTopology: true, useNewUrlParser: true}); 
// b/c mongoose change by defaut use the older way to access mongodb (deprecated use currently)
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', ()=> console.log('connected to mongoose'));


// set up
app.listen(process.env.PORT || 3000);// pull from env