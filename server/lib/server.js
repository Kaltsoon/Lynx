var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(socket){
  var room = socket.handshake.query.store;
  
  socket.join(room);

  socket.on('disconnect', function() {
    socket.leave(room)
  });
});

module.exports = {
  server,
  app,
  io
};
