const express = require('express');
const socketio = require('socket.io');

var PORT = 8080;

var app = express();

var server = () =>  app.listen(PORT, () => {
    console.log('serveur ecouté sur le port : ' + PORT)
});

var io = socketio(server());
var game = io.of('/game');


module.exports = {app, server, io, game}
