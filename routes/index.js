const express = require('express');
const router = express.Router();

// this root is port 3000 
router.get('/', (req, res)=>{
    res.render('index'); // just work when connect to server
}); 

module.exports = router;