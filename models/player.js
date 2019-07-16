const mongoose = require('mongoose');
var Schema = mongoose.Schema;
let Carte = require('./carte.js');

const cartesPlayerSchema = new Schema({
    main : {type: Map,
            of: {Carte},
            max: 7},
    board: {type: Map,
            of: {Carte},
            max: 7}
});


const playerSchema = new Schema({
    pseudo : String,
    distance: Number,
    cartes: [cartesPlayerSchema]
});



let Player = mongoose.model('Player', playerSchema);
let cartesPlayer = mongoose.model('cartesPlayer', cartesPlayerSchema);

module.exports = Player, cartesPlayer;
