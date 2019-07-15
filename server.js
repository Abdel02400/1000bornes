const express = require('express');

var PORT = 8080;
var app = express();

var server = app.listen(PORT, ajoutcarte(), () => {
    console.log('serveur ecouté sur le port : ' + PORT)
});


