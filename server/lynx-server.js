var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require('body-parser');

var server = require('./lib/server');
var Store = require('./lib/store');
var api = require('./lib/api');

var LynxServer = (function(){
  var defaultOptions = { port: 8080, mongo: 'mongodb://localhost/lynx' };
  var self = {};

  self.release = function(options){
    var lynxOptions = Object.assign(defaultOptions, options);

    initApi();

    server.server.listen(lynxOptions.port);
    mongoose.connect(lynxOptions.mongo);
  }

  self.registerStore = function(name, attributes){
    Store.registerStore(name, attributes);
  }

  function initApi(){
    server.app.use(bodyParser.json());
    server.app.use(cors());
    server.app.use('/lynx', api);
  }

  return self;
})();

module.exports = LynxServer;
