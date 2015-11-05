var express = require('express');
var router = express.Router();

var Store = require('./store');
var server = require('./server');

router.get('/:store', function(req, res, next){
  var targetStore = req.params.store;

  Store.getAll(targetStore)
    .then(items => res.json(items));
});

router.post('/:store', function(req, res, next){
  var targetStore = req.params.store;
  var item = req.body;

  Store.create(targetStore, item)
    .then((item) => {
      server.io.emit('lynx', { store: targetStore, type: 'create', data: { item: item } });
      return res.json(item);
    });
});

router.delete('/:store/:id', function(req, res, next){
  var targetStore = req.params.store;
  var itemId = req.params.id;

  Store.remove(targetStore, itemId)
    .then(() => {
      server.io.emit('lynx', { store: targetStore, type: 'remove', data: { itemId: itemId } });
    });
});

router.put('/:store/:id', function(req, res, next){
  var targetStore = req.params.store;
  var itemId = req.params.id;
  var attributes = req.body;

  Store.update(targetStore, itemId, attributes)
    .then((item) => {
      server.io.emit('lynx', { store: targetStore, type: 'update', data: { itemId: itemId, attributes: attributes } });
    });
});

module.exports = router;
