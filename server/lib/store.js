var mongoose = require('mongoose');

var Store = (function(){
  var self = {};

  var registeredStores = [];

  self.registerStore = function(name, attributes){
    if(typeof name === 'undefined' || typeof name !== 'string' || name === ''){
      throw 'No name provided for the store!';
    }

    if(name.charAt(0) === '_'){
      throw 'Store name can\'t start with "_"!';
    }

    if(typeof attributes !== 'object' || attributes == null){
      throw 'No attributes provided for the store';
    }

    registeredStores.push(name);

    mongoose.model(name.toLowerCase(), attributes);
  }

  self.getRegisteredStores = function(){
    return registeredStores;
  }

  self.getAll = function(storeName){
    if(typeof storeName === 'undefined' || typeof storeName !== 'string'){
      throw 'No name provided for the store!';
    }

    var model = mongoose.models[storeName.toLowerCase()];

    return model.find();
  }

  self.create = function(storeName, item){
    if(typeof storeName === 'undefined' || typeof storeName !== 'string'){
      throw 'No name provided for the store!';
    }

    if(typeof item !== 'object' || item == null){
      throw 'No item provided for create';
    }

    var model = mongoose.models[storeName.toLowerCase()];

    return model.create(item);
  }

  self.remove = function(storeName, itemId){
    if(typeof storeName === 'undefined' || typeof storeName !== 'string'){
      throw 'No name provided for the store!';
    }

    if(typeof itemId === 'undefined' || typeof itemId !== 'string'){
      throw 'No item id provided for remove';
    }

    var model = mongoose.models[storeName.toLowerCase()];

    return model.remove({ _id: itemId });
  }

  self.update = function(storeName, itemId, attributes){
    if(typeof storeName === 'undefined' || typeof storeName !== 'string'){
      throw 'No name provided for the store!';
    }

    if(typeof itemId === 'undefined' || typeof itemId !== 'string'){
      throw 'No item id provided for remove';
    }

    if(typeof attributes !== 'object' || attributes == null){
      throw 'No attributes provided for update';
    }

    var model = mongoose.models[storeName.toLowerCase()];

    return model.update({ _id: itemId }, attributes);
  }

  return self;
})();

module.exports = Store;
