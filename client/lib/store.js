var pubsub = require('pubsub-js');
var io = require('socket.io-client');
var _ = require('lodash');
var q = require('q');

const CHANGE_EVENT = 'CHANGE_EVENT';
const REMOVE_EVENT = 'REMOVE_EVENT';
const CREATE_EVENT = 'CREATE_EVENT';
const UPDATE_EVENT = 'UPDATE_EVENT';
const UNAUTHORIZED_EVENT = 'UNAUTHORIZED_EVENT';

function Store(options){
  this._lynx = options.lynx;
  this._name = options.name.toLowerCase();
  this._events = pubsub;
  this._data = [];

  this._initSocket();
}

Store.prototype.onChange = function(callback){
  if(typeof callback !== 'function'){
    throw 'Change callback must be a function!';
  }

  this._events.subscribe(CHANGE_EVENT, callback);
}

Store.prototype.onRemove = function(callback){
  if(typeof callback !== 'function'){
    throw 'Remove callback must be a function!';
  }

  this._events.subscribe(REMOVE_EVENT, callback);
}

Store.prototype.onCreate = function(callback){
  if(typeof callback !== 'function'){
    throw 'Create callback must be a function!';
  }

  this._events.subscribe(CREATE_EVENT, callback);
}

Store.prototype.onUpdate = function(callback){
  if(typeof callback !== 'function'){
    throw 'Update callback must be a function!';
  }

  this._events.subscribe(UPDATE_EVENT, callback);
}

Store.prototype.onUnAuthorized = function(callback){
  if(typeof callback !== 'function'){
    throw 'Unauthorized callback must be a function!';
  }

  this._events.subscribe(UNAUTHORIZED_EVENT, callback);
}

Store.prototype._create = function(item){
  this._data.push(item);

  this._events.publish(CHANGE_EVENT);
  this._events.publish(CREATE_EVENT, item);
}

Store.prototype.create = function(item){
  if(typeof item !== 'object' || item == null){
    throw 'Only objects can be added to the store!';
  }

  var context = this;

  var xhttp = new XMLHttpRequest();
  var server = this._lynx.getServer();

  xhttp.onreadystatechange = function() {
    if(xhttp.status == 401){
      context._events.publish(UNAUTHORIZED_EVENT);
    }
  }

  xhttp.open('POST', 'http://' + server.host + ':' + server.port + '/lynx/' + context._name, true);
  xhttp.setRequestHeader('Authorization', 'Bearer ' + context._getToken());
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(JSON.stringify(item));
}

Store.prototype._remove = function(itemId){
  _.remove(this._data, function(item){
    return item._id === itemId;
  });

  this._events.publish(CHANGE_EVENT);
  this._events.publish(REMOVE_EVENT, itemId);
}

Store.prototype.remove = function(itemId){
  if(typeof itemId !== 'string'){
    throw 'Invalid item id provided for remove!';
  }

  var context = this;

  var xhttp = new XMLHttpRequest();
  var server = this._lynx.getServer();

  xhttp.onreadystatechange = function() {
    if(xhttp.status == 401){
      context._events.publish(UNAUTHORIZED_EVENT);
    }
  }

  xhttp.open('DELETE', 'http://' + server.host + ':' + server.port + '/lynx/' + context._name + '/' + itemId, true);
  xhttp.setRequestHeader('Authorization', 'Bearer ' + context._getToken());
  xhttp.send();
}

Store.prototype._update = function(itemId, attributes){
  delete attributes._id;

  var data = this._data;

  for(var index = 0; index < this._data.length; index++){
    if(data[index]._id == itemId){
      data[index] = _.assign(data[index], attributes);
    }
  }

  this._events.publish(CHANGE_EVENT);
  this._events.publish(UPDATE_EVENT, { itemId: itemId, attributes: attributes });
}

Store.prototype.update = function(itemId, attributes){
  if(typeof itemId !== 'string'){
    throw 'Invalid item id provided for update!';
  }

  if(typeof attributes !== 'object' || attributes == null){
    throw 'Invalid attributes provided for update!';
  }

  var context = this;

  var xhttp = new XMLHttpRequest();
  var server = this._lynx.getServer();

  xhttp.onreadystatechange = function() {
    if(xhttp.status == 401){
      context._events.publish(UNAUTHORIZED_EVENT);
    }
  }

  xhttp.open('PUT', 'http://' + server.host + ':' + server.port + '/lynx/' + context._name + '/' + itemId, true);
  xhttp.setRequestHeader('Authorization', 'Bearer ' + context._getToken());
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(JSON.stringify(attributes));
}

Store.prototype.getAll = function(){
  return this._data;
}

Store.prototype.fetch = function(){
  var context = this;

  this._getData()
    .then(function(data){
      context._data = data;
      context._events.publish(CHANGE_EVENT);
    });
}

Store.prototype._getData = function(){
  var xhttp = new XMLHttpRequest();
  var context = this;
  var server = this._lynx.getServer();
  var deferred = q.defer();

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      deferred.resolve(JSON.parse(xhttp.responseText));
    }else if(xhttp.status == 401){
      context._events.publish(UNAUTHORIZED_EVENT);
    }
  }

  xhttp.open('GET', 'http://' + server.host + ':' + server.port + '/lynx/' + context._name, true);
  xhttp.setRequestHeader('Authorization', 'Bearer ' + context._getToken());
  xhttp.send();

  return deferred.promise;
}

Store.prototype._getToken = function(){
  return localStorage.getItem('lynxToken') || '';
}

Store.prototype._initSocket = function(){
  var server = this._lynx.getServer();
  var context = this;

  this._socket = io('http://' + server.host + ':' + server.port, { query: 'store=' + context._name });

  this._socket.on('lynx', function(transaction) {
    switch(transaction.type){
      case 'create':
        context._create(transaction.data.item);
        break;
      case 'remove':
        context._remove(transaction.data.itemId);
        break;
      case 'update':
        context._update(transaction.data.itemId, transaction.data.attributes);
        break;
      default:
        // nop
    }
  });
}

module.exports = Store;
