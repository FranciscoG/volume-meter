var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

var audio = require('./routes/audio.js');

app.use('/play', audio);

app.use('/save', audio);

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Volume Meter'
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});