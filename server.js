var debug = require('debug')('volume-meter');
var express = require('express');
var path = require('path');
var app = express();

// set out views folder and template engine
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// define our routes and their controllers 
var routes = require('./routes');
app.use('/scream', routes.audio);
app.use('/scores', routes.scores);
app.use('/', routes.index);

// Set folder where public static content like CSS, images, 
// and JS files will be loaded from
app.use(express.static(path.join(__dirname, 'public')));

// 404 error handling
app.use(function(req, res, next) {
  res.status(404);
  res.render('error', {
    title: 'Volume Meter | Page not found'
  });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});