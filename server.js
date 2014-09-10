var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Volume Meter'
  });
});

app.get('/play', function(req, res) {
  res.render('play', {
    title: 'Your Noise'
  });
});

app.post('/save', function(req, res, next) {
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
  fs.writeFile(__dirname + '/audio/' + 'my-noise-' + Date.now() + '.wav', req.rawBody, 'binary', function(err) {
    if (err) {
      throw err;
    }
    return;
  });
}

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});