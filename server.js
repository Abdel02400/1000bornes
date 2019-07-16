const express = require('express');
const sockets = require('./sockets/sockets');
const router = require('./routes/routes');
const bodyParser = require('body-parser');
const {app, game} = require('./config/config');
var carte = require('./middleware/carte.js');
let Carte = require('./models/carte.js');


app.use('/', router);
app.use(express.static('static'));
app.use(bodyParser.json());

game.on('connection', sockets.gameNamespace);

mongoose.connect('mongodb://localhost:27017/1000bornes', {useNewUrlParser : true})
.then(() => console.log("Connected to database"))
.catch(err => {
    console.log(err);
    process.exit();
});

var server = app.listen(PORT, carte.ajoutCarte(), () => {
    console.log('serveur ecouté sur le port : ' + PORT);
    generateDeck();

});

function generateDeck() {
  var deck = [];

  findCardsType.then((Cards) => {
    try{

      for(var i = 0; i < Cards.length; i++) {
        if(Cards[i].type == "Botte") {
          deck.push(Cards[i]);
        } // FIN BOTTE
        if(Cards[i].type == "Attaque") {
          if(Cards[i].nom == "panne" || Cards[i].nom == "accident" || Cards[i].nom == "crevaison") {
            for(var a = 0; a < 3; a++) {
              deck.push(Cards[i]);
            }
          }
          else {
            if(Cards[i].nom == "limit") {
              for(var a = 0; a < 4; a++) {
                deck.push(Cards[i]);
              }
            }
            if(Cards[i].nom == "feu_rouge"){
              for(var a = 0; a < 5; a++) {
                deck.push(Cards[i]);
              }
            }
          }

        } // FIN ATTAQUE


        if(Cards[i].type == "Parade") {
          if(Cards[i].nom != "feu_vert") {
            for(var p = 0; p < 6; p++) {
              deck.push(Cards[i]);
            }
          }
          else {
            for(var p = 0; p < 14; p++) {
              deck.push(Cards[i]);
            }
          }
        } // FIN PARADE


        if(Cards[i].type == "Distance") {
          if(Cards[i].nom == "25km" || Cards[i].nom == "50km" || Cards[i].nom == "75km") {
            for(var a = 0; a < 10; a++) {
              deck.push(Cards[i]);
            }
          }
          else {
            if(Cards[i].nom == "100km") {
              for(var a = 0; a < 12; a++) {
                deck.push(Cards[i]);
              }
            }
            if(Cards[i].nom == "200km") {
              for(var a = 0; a < 4; a++) {
                deck.push(Cards[i]);
              }
            }
          }

        } // FIN DISTANCE


    }
    let countDistance = 0;
    let countBotte = 0;
    let countParade = 0;
    let countAttaque = 0;
      for(i = 0; i < deck.length; i++) {
        if(deck[i].type == "Distance") {

          countDistance++;
        }

        if(deck[i].type == "Botte") {

          countBotte++;
        }

        if(deck[i].type == "Parade") {

          countParade++;
        }

        if(deck[i].type == "Attaque") {

          countAttaque++;
        }

      };
      console.log("NOMBRE DISTANCE : " + countDistance);
      console.log("NOMBRE BOTTE : " + countBotte);
      console.log("NOMBRE PARADE : " + countParade);
      console.log("NOMBRE ATTAQUE : " + countAttaque);
      console.log("TAILLE DU DECK : " + deck.length);
      var ctr = deck.length, temp, index;

      // Mélange du tableau
      while (ctr > 0) {

      index = Math.floor(Math.random() * ctr);

      ctr--;

      temp = deck[ctr];
      deck[ctr] = deck[index];
      deck[index] = temp;
      }

      resolve(deck);

    }
    catch {
    }

  })

}

var findCardsType = new Promise(function(resolve, reject){

  let Cards = Carte.find({}, function(err, cartesRetour) {
    if(err) throw err;
  }).lean();

  resolve(Cards);
});

module.exports = {app};
