const express = require('express'),
router = express.router()

// Car brands page
router.get('/:username', function(req, res) {
  // res.render('business-home', {
          //   business: user,
          // });
})

// Car models page
router.get('/models', function(req, res) {
  res.send('Audi Q7, BMW X5, Mercedes GL')
})

module.exports = router;