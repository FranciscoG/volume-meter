var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('leaderboard', {
    title: 'Volume Meter | Leaderboard'
  });
});

module.exports = router;