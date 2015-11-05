var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

var Store = require('./store');
var Auth = require('./auth');
var server = require('./server');

function verifyStore(req, res, next){
  var storeName = req.params.store;

  if(Store.getRegisteredStores().indexOf(storeName) < 0 || !mongoose.models[storeName]){
    res.status(404).json({ message: 'NO_SUCH_STORE' });
  }else{
    next();
  }
}

router.post('/_register', function(req, res, next){
  var userModel = Auth.getUserModel();
  var newUser = new userModel(req.body);

  newUser.save()
    .then(
      () => {
        res.json({
          user: newUser,
          token: Auth.createTokenForUser(newUser)
        });
      },
      (err) => {
        res.status(400).json({ message: 'INVALID_USERNAME_OR_PASSWORD' });
      }
    )
});

router.post('/_authenticate', function(req, res, next){
  var userModel = Auth.getUserModel();
  var userToCheck = new userModel(req.body);

  userToCheck.authenticate()
    .then(user => {
      return res.json({
        user: user,
        token: Auth.createTokenForUser(user)
      });
    })
    .catch(err => res.status(401).json({ message: err }));
});

router.get('/:store', verifyStore, Auth.verifyAuthentication('fetch'), function(req, res, next){
  var targetStore = req.params.store;

  Store.getAll(targetStore)
    .then(items => res.json(items));
});

router.post('/:store', verifyStore, Auth.verifyAuthentication('create'), function(req, res, next){
  var targetStore = req.params.store;
  var item = req.body;

  Store.create(targetStore, item)
    .then((item) => {
      server.io.to(targetStore).emit('lynx', { type: 'create', data: { item: item } });
      return res.json(item);
    });
});

router.delete('/:store/:id', verifyStore, Auth.verifyAuthentication('remove'), function(req, res, next){
  var targetStore = req.params.store;
  var itemId = req.params.id;

  Store.remove(targetStore, itemId)
    .then(() => {
      server.io.to(targetStore).emit('lynx', { type: 'remove', data: { itemId: itemId } });
      return res.status(200).send();
    });
});

router.put('/:store/:id', verifyStore, Auth.verifyAuthentication('update'), function(req, res, next){
  var targetStore = req.params.store;
  var itemId = req.params.id;
  var attributes = req.body;

  Store.update(targetStore, itemId, attributes)
    .then((item) => {
      server.io.to(targetStore).emit('lynx', { type: 'update', data: { itemId: itemId, attributes: attributes } });
      return res.json(item);
    });
});

module.exports = router;
