const express = require('express');
const sockets = require('./sockets/sockets');
const router = require('./routes/routes');
const bodyParser = require('body-parser');
const {app, game} = require('./config/config');
const mongoose = require('mongoose');
var carte = require('./middleware/carte.js');
let Carte = require('./models/carte.js');


app.use('/', router);
app.use(express.static('static'));
app.use(bodyParser.json());

var PORT = 8080;

game.on('connection', sockets.gameNamespace);

