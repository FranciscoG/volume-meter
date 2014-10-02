var express = require('express');
var fs = require('fs');
var router = express.Router();

// save new audio via ajax and create new DB entry
router.post('/save', function(req, res) {
  var data = new Buffer('');
  req.on('data', function(chunk) {
    data = Buffer.concat([data, chunk]);
  });
  req.on('end', function() {
    req.rawBody = data;
    done(req, res);
  });
});

// get Audio ID from route and return the player page
// no DB connection needed
router.get('/:id(\\d+)', function(req, res) {
  var aID = req.params.id;
  res.render('play', {
    title: 'Your Noise',
    audioId: aID
  });
});

// redirect back to home page if no route info exists
router.get('/', function(req, res) {
  res.redirect('/');
});


function done(req, res) {
  // save to S3 
  // update MongoDB, etc
  fs.writeFile('audio/' + 'my-noise-' + Date.now() + '.wav', req.rawBody, 'binary', function(err) {
    if (err) {
      throw err;
    }
    res.send(true);
  });
}

module.exports = router;