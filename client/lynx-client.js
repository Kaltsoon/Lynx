var q = require('q');

var Store = require('./lib/store');

function LynxClient(options){
  if(typeof options === 'undefined'){
    throw 'No server url provided for lynx client!';
  }

  if(typeof options.host === 'undefined'){
    throw 'No host provided for lynx client!';
  }

  if(typeof options.port === 'undefined'){
    throw 'No port provided for lynx client!';
  }

  this._server = { host: options.host, port: options.port };
}

LynxClient.prototype.getStore = function(storeName){
  if(typeof storeName === 'undefined' || typeof storeName !== 'string'){
    throw 'No store name provided!';
  }

  return new Store({ lynx: this, name: storeName });
}

LynxClient.prototype.authenticate = function(credentials){
  if(typeof credentials !== 'object' || credentials == null){
    throw 'No credentials provided!';
  }

  var context = this;
  var server = this._server
  var deferred = q.defer();

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var res = JSON.parse(xhttp.responseText);
      localStorage.setItem('lynxToken', res.token);
      deferred.resolve(res);
    }else if (xhttp.status == 401){
      deferred.reject(JSON.parse(xhttp.responseText));
    }
  }

  xhttp.open('POST', 'http://' + server.host + ':' + server.port + '/lynx/_authenticate', true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(JSON.stringify(credentials));

  return deferred.promise;
}

LynxClient.prototype.createUser = function(credentials){
  if(typeof credentials !== 'object' || credentials == null){
    throw 'No credentials provided!';
  }

  var context = this;
  var server = this._server
  var deferred = q.defer();

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var res = JSON.parse(xhttp.responseText);
      localStorage.setItem('lynxToken', res.token);
      deferred.resolve(res);
    }else if (xhttp.status == 400){
      deferred.reject(JSON.parse(xhttp.responseText));
    }
  }

  xhttp.open('POST', 'http://' + server.host + ':' + server.port + '/lynx/_register', true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(JSON.stringify(credentials));

  return deferred.promise;
}

LynxClient.prototype.unauthenticate = function(){
  localStorage.setItem('lynxToken', '');
}

LynxClient.prototype.getServer = function(){
  return this._server;
}

module.exports = LynxClient;
