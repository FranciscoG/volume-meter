var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();
var audio = require('./audio');
var scores = require('./leaderboard');

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var the_routes = {};

// home page
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Volume Meter'
  });
});


router.post('/submit', urlencodedParser,  function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }
  console.log(req.body);
  // take data and update mongoDB
  // return true or false
  res.send(true);
});

the_routes.index = router;
the_routes.audio = audio;
the_routes.scores = scores;

module.exports = the_routes;