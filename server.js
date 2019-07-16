const express = require('express');
const sockets = require('./sockets/sockets');
const router = require('./routes/routes');
const bodyParser = require('body-parser');
const {app, game} = require('./config/config');

app.use('/', router);
app.use(express.static('static'));
app.use(bodyParser.json());

game.on('connection', sockets.gameNamespace);



