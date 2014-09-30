var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mydb'); // this is the testing db,  change later in a config.json file

/**************************************
 * Test DB Connection
 */

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('we have connection');
});

