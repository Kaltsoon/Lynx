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
    throw 'No store name provided';
  }

  return new Store({ lynx: this, name: storeName });
}

LynxClient.prototype.getServer = function(){
  return this._server;
}

module.exports = LynxClient;
