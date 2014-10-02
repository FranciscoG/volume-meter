var express = require('express');
var router = express.Router();
var audio = require('./audio');
var scores = require('./leaderboard');

var the_routes = {};

the_routes.index = router.get('/', function(req, res) {
  res.render('index', {
    title: 'Volume Meter'
  });
});

the_routes.audio = audio;
the_routes.scores = scores;

module.exports = the_routes;