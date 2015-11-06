var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require('body-parser');
var _ = require('lodash');

var server = require('./lib/server');
var Store = require('./lib/store');
var Auth = require('./lib/auth');
var api = require('./lib/api');

var LynxServer = (function(){
  var defaultOptions = { port: 8080, mongo: 'mongodb://localhost/lynx' };
  var self = {};

  self.release = function(options){
    if(_.keys(Auth.getAuthentications).length > 0 && !Auth.getSecret()){
      throw 'No authentication secret set!';
    }

    var lynxOptions = Object.assign(defaultOptions, options);

    initApi();

    server.server.listen(lynxOptions.port);
    mongoose.connect(lynxOptions.mongo);
  }

  self.setAuthenticationSecret = function(secret){
    if(typeof secret === 'undefined' || typeof secret !== 'string'){
      throw 'Secret must be a string!';
    }

    Auth.setSecret(secret);
  }

  self.registerStore = function(name, options){
    if(typeof options.authenticate !== 'undefined'){
      Auth.setAuthentication(name, options.authenticate);
    }

    Store.registerStore(name, options.attributes);
  }

  function initApi(){
    Auth.createUserModel();

    server.app.use(bodyParser.json());
    server.app.use(cors());
    server.app.use('/lynx', api);
  }

  return self;
})();

module.exports = LynxServer;
