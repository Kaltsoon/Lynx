var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Auth = require('./auth');

io.on('connection', function(socket){
  var room = socket.handshake.query.store;
  var token = socket.handshake.query.token;

  Auth.verifyToken(token)
    .then(() => { socket.join(room) })
    .catch(() => { socket.emit('lynx_error', { message: 'INVALID_TOKEN' }) });

  socket.on('disconnect', function() {
    socket.leave(room)
  });
});

module.exports = {
  server,
  app,
  io
};
