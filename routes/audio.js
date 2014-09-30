var express = require('express');
var router = express.Router();

// get Audio ID from route and return the player page
// no DB connection needed
router.get('/:audio_id?', function(req, res, next, post_id) {
  var aID = req.params.id;
  if (!aID) {
    // send user back to the home page
  } else {
    res.render('play', {
      title: 'Your Noise',
      audioId: aID
    });
  }
});

// save new audio via ajax and create new DB entry
router.post('/', function(req, res, next) {
  var data = new Buffer('');
  req.on('data', function(chunk) {
    data = Buffer.concat([data, chunk]);
  });
  req.on('end', function() {
    req.rawBody = data;
    done(req, res);
  });
  next();
});

function done(req, res) {
  // save to S3 
  // update MongoDB
  fs.writeFile(__dirname + '/audio/' + 'my-noise-' + Date.now() + '.wav', req.rawBody, 'binary', function(err) {
    if (err) {
      throw err;
    }
    return;
  });
}

module.exports = router;