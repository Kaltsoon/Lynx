var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var q = require('q');
var bcrypt = require('bcrypt');

var Auth = (function(){
  var self = {};

  var authentications = {};
  var jwtSecret = null;
  var userModel = null;

  self.createUserModel = function(){
    var userSchema = new Schema({
      username: { type: String, required: true },
      passwordHash: { type: String, required: true }
    });

    userSchema.virtual('password')
      .set(function(value){
        this._password = value;
        this.passwordHash = bcrypt.hashSync(value, 10);
      });

    userSchema.path('username')
      .validate(function(value, callback){
        var context = this;

        mongoose.models.User.findOne({ username: context.username }, (err, user) => {
          if(user){
            callback(false);
          }else{
            callback(true);
          }
        });
      }, 'Username already exists!');

    userSchema.methods.authenticate = function(){
      var context = this;
      var deferred = q.defer();

      if(!context.username || !context._password){
        deferred.reject('NO_USERNAME_OR_PASSWORD_PROVIDED');
      }

      mongoose.models._lynx_user.findOne({ username: context.username })
        .then(user => {
          if(user && bcrypt.compareSync(context._password, user.passwordHash)){
            deferred.resolve(user);
          }else{
            deferred.reject('WRONG_EMAIL_OR_PASSWORD');
          }
        });

      return deferred.promise;
    }

    userModel = mongoose.model('_lynx_user', userSchema);
  }

  self.getUserModel = function(){
    if(!userModel){
      throw 'No user schema created!';
    }

    return userModel;
  }

  self.setAuthentication = function(storeName, actions){
    authentications[storeName] = actions;
  }

  self.getAuthentications = function(){
    return authentications;
  }

  self.setSecret = function(secret){
    jwtSecret = secret;
  }

  self.getSecret = function(){
    return jwtSecret;
  }

  self.createTokenForUser = function(user){
    return jwt.sign(user, jwtSecret, {
      expiresIn: 60 * 60 * 12
    });
  }

  self.verifyToken = function(token){
    var deferred = q.defer();

    if(typeof token === 'undefined' || typeof token !== 'string'){
      deferred.reject();
    }

    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (err) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  }

  self.verifyAuthentication = function(action){
    return function(req, res, next){
      var storeName = req.params.store;

      if(!authentications[storeName] || authentications[storeName].indexOf(action) < 0){
        next();
      }else{
        var bearerHeader = req.headers['authorization'];

        if(!bearerHeader){
          res.status(401).json({ message: 'NO_TOKEN_PROVIDED' });
          return;
        }

        var bearer = bearerHeader.split(' ');
        var bearerToken = bearer[1];

        jwt.verify(bearerToken, jwtSecret, function(err, decoded) {
          if (err) {
            res.status(401).json({ message: 'INVALID_TOKEN' });
          } else {
            req.decodedToken = decoded;
            next();
          }
        });
      }
    }
  }

  return self;
})();

module.exports = Auth;
