const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const carteSchema = new Schema({
    nom : String,
    type: String,
    url: String,
});

let Carte = mongoose.model('Carte', carteSchema);

module.exports = Carte;
