const mongoose = require('mongoose');
//const Carte = require('./models/carte.js');
const {game} = require('../config/config.js');
const redis = require('redis');
let Carte = require('../models/carte.js');

var redisClient = redis.createClient(6379, '127.0.0.1');
mongoose.connect(
    'mongodb://localhost:27017/1000bornes', { useNewUrlParser:true }
);
mongoose.set('useFindAndModify', false);

var gameNamespace = (socket) => {

    socket.emit('message','Bienvenue sur le jeux de 1000 bornes');

    var getPlayersId = () => {
        return new Promise((resolve, reject) => {
            redisClient.smembers("joueurs", (err, result) => {
                if(err) reject(err);
                resolve(result);
            });
        })
    }

    var getUser = (id) => {
        return new Promise((resolve, reject) => {
            redisClient.hgetall(id, (err, result) => {
                if(err) reject(err);
                resolve(result);
            });
        })
    }

    var getTour = () => {
        return new Promise((resolve, reject) => {
            redisClient.hgetall("tour", (err, result) => {
                if(err) reject(err);
                resolve(result);
            });
        })
    }

    var resetGame = () => {
        return new Promise((resolve, reject) => {
            redisClient.hgetall('game', (err, result) => {
                if(result !== null) {
                    redisClient.flushall( (err, result) => {
                        if(err) reject(err);
                        resolve(true);
                    });
                }else resolve(false)
            });
        })
    }

    redisClient.smembers("joueurs", (err, result) => {
        if(result.length >= 4) {
            socket.emit('complete', true);
            socket.broadcast.emit('complete', true);
        }
        else {
            socket.emit('complete', false);
            socket.broadcast.emit('complete', false);
        }
    });

    redisClient.hgetall('game', (err, result) => {
        if(result === null) {
            socket.emit('start', false);
            socket.broadcast.emit('start', false);
        }else {
            socket.emit('start', true);
            socket.broadcast.emit('start', true);
        }
    });

    socket.on('eventCard', async (data) => {
        var data = {
            expediteur: socket.id,
            destinataire: socket.id,
            cardElement: card,
        };
        var isMovePlayable = false;
        switch (data.cardElement.type) {
          case "Distance":
            isMovePlayable = playDistance(data.cardElement, data.expediteur);
          case "Botte":
            isMovePlayable = playBotte(card.cardElement, data.expediteur);
          case "Attaque":
            isMovePlayable = playAttaque(card.cardElement, data.expediteur, data.destinataire);
          case "Parade":
            isMovePlayable = playParade(card.cardElement, data.expediteur);
        }
        socket.emit('playJoueur', isMovePlayable); // RETOUR AU FRONT
      }
    );

    socket.on('start', async (data) => {
        redisClient.hmset('game', "start", data);
        socket.emit('start', true);
        socket.broadcast.emit('start', true);

        var deck = await generateDeck();
        var trash = [];
        var playersIds = await getPlayersId();

        var result;
        var main = {};
        // Distribution des cartes premier tour
        for (var i = 0; i < playersIds.length; i++) {
            result = await distributeCards(6, playersIds[i], deck);
            var user = await getUser(playersIds[i]);
            main[playersIds[i]] = result.main;
            main[playersIds[i]].player = user.player;
        }

        var allinfo = {
            deck: result.deck,
            main: main
        }

        redisClient.hmset("tour", "player", 1);
        var tour = await getTour();
        var nbJoueurs = playersIds.length;

        socket.emit('tour', {tour, nbJoueurs});
        socket.broadcast.emit('tour', {tour, nbJoueurs});

        socket.emit('deck', allinfo);
        socket.broadcast.emit('deck', allinfo);
        deck = result.deck;
        trash = result.trash;
        socket.emit('deck', result);
        socket.broadcast.emit('deck', result);

    })


    socket.on('addPlayer', async (data) => {

        var res = socket.id.split('#');
        var id = res[1];

        var playersIds = await getPlayersId();

        redisClient.sadd('joueurs', id);
        redisClient.hmset(id, "name", data, "socketid", id, "score", 0, "player", playersIds.length + 1);



        var players = {};
        var user = await getUser(id);
        playersIds = await getPlayersId();

        socket.emit('myProfil', user);

        for(var i=0; i< playersIds.length; i++) {
            user = await getUser(playersIds[i]);
            players[user.socketid] = {
                name: user.name,
                score: user.score,
                socketid: user.socketid,
                player: user.player
            }
        }

        if(playersIds.length === 4) {
            socket.broadcast.emit('complete', true);
        }

        socket.emit('listPlayer', {players});
        socket.broadcast.emit('listPlayer', {players});


    });

    socket.on('disconnect',  async (data) => {
        var res = socket.id.split('#');
        var id = res[1];
        var nbplayer;

        var playersIds = await getPlayersId();

        for(var i=0; i< playersIds.length; i++) {
            if(playersIds[i] === id) {
                var user = await getUser(playersIds[i]);
                nbplayer = user.player;
                redisClient.del(id);
                redisClient.srem('joueurs', id);
                var gameFinished = await resetGame();
                if(gameFinished) socket.broadcast.emit('finishGame', true);
            }

        }

        playersIds = await getPlayersId();
        for(var i=0; i< playersIds.length; i++) {
            user = await getUser(playersIds[i]);
            if(user.player > nbplayer){
                var newResult = parseInt(user.player) -1;
                redisClient.hset(user.socketid, 'player', newResult);
            }
        }

        var players = {};
        playersIds = await getPlayersId();

        for(var i=0; i< playersIds.length; i++) {
            user = await getUser(playersIds[i]);
            players[user.socketid] = {
                name: user.name,
                score: user.score,
                socketid: user.socketid,
                player: user.player
            }
        }


        socket.broadcast.emit('listPlayer', {players});
    });
}


function playDistance(card, expediteur) {
    var isMovePlayable = false;
    switch (card.nom) {
      case "25km": {
        if (expediteur.score + 25 <= 1000 && expediteur.alteration == "") {
            expediteur.score += 25;
          isMovePlayable = true;
        }
      }
      case "50km": {
        if (expediteur.score + 50 <= 1000 && expediteur.alteration == "") {
            expediteur.score += 50;
          isMovePlayable = true;
        }
      }
      case "75km": {
        if (expediteur.score + 75 <= 1000 && (expediteur.alteration == "" || expediteur.alteration != "limit")) {
            expediteur.score += 75;
          isMovePlayable = true;
        }
      }
      case "100km": {
        if (expediteur.score + 100 <= 1000 && (expediteur.alteration == "" || expediteur.alteration != "limit")) {
            expediteur.score += 100;
          isMovePlayable = true;
        }
      }
      case "200km": {
        if (expediteur.score + 200 <= 1000 && (expediteur.alteration == "" || expediteur.alteration != "limit")) {
            expediteur.score += 200;
          isMovePlayable = true;
        }
      }
    }
    return (isMovePlayable);
  }

  function playParade(card, expediteur) {
    var isMovePlayable = false;
    switch (card.nom) {
      case "essence": {
        if (expediteur.alteration == "panne")
          isMovePlayable = true;
      }
      case "fin_limit": {
        if (expediteur.alteration == "limit")
          isMovePlayable = true;
      }
      case "feu_vert": {
        if (expediteur.alteration == "feu_rouge")
          isMovePlayable = true;
      }
      case "reparations": {
        if (expediteur.alteration == "accident")
          isMovePlayable = true;
      }
      case "roue": {
        if (expediteur.alteration == "crevaison")
          isMovePlayable = true;
      }
    }
    return (isMovePlayable);
  }

  function playBotte(card, expediteur) {
    expediteur.bottes.push(card.nom);
    return true;
  }

  function playAttaque(card, expediteur, destinataire) {
    var isMovePlayable = false;
    switch (carte.nom) {
      case "panne": {
        if (!destinataire.bottes.includes("citerne") && destinataire.alteration == "") {
            destinataire.alteration = carte.nom;
          isMovePlayable = true;
        }
      }
      case "limit": {
        if (!destinataire.bottes.includes("prioritaire") && destinataire.alteration == "") {
            destinataire.alteration = carte.nom;
          isMovePlayable = true;
        }
      }
      case "feu_rouge": {
        if (!destinataire.bottes.includes("prioritaire") && destinataire.alteration == "") {
            destinataire.alteration = carte.nom;
          isMovePlayable = true;
        }
      }
      case "accident": {
        if (!destinataire.bottes.includes("as_volant") && destinataire.alteration == "") {
            destinataire.alteration = carte.nom;
          isMovePlayable = true;
        }
      }
      case "crevaison": {
        if (!destinataire.bottes.includes("increvable") && destinataire.alteration == "") {
            destinataire.alteration = carte.nom;
          isMovePlayable = true;
        }
      }
    }
    return (isMovePlayable);
  }


  function checkVictory(player) {
    if (player.score === 1000)
      socket.broadcast.emit('win', player);
  }

var distributeCards = (numberCards, playerID, deck) => {
    return new Promise( (resolve, reject) =>{
        var cardsElt = [];
        for(var i = 0; i < numberCards; i++)
        {
            cardsElt.push(deck[deck.length - 1]);
            trash.push(deck[deck.length - 1 ]);
            deck.pop();
        }
        var main;

        main = {
            cards: cardsElt,
            number: cardsElt.length,
            socketid: playerID,
        }
        var result = {main : main
            ,deck : deck,
            trash: trash};

        resolve(result);
    })
}

var generateDeck = () => {
    return new Promise((resolve, reject) => {
        var deck = [];

        findCardsType.then((Cards) => {
            try{

                for(var i = 0; i < Cards.length; i++) {
                    if(Cards[i].type === "Botte") {
                        deck.push(Cards[i]);
                    } // FIN BOTTE
                    if(Cards[i].type === "Attaque") {
                        if(Cards[i].nom === "panne" || Cards[i].nom === "accident" || Cards[i].nom === "crevaison") {
                            for(var a = 0; a < 3; a++) {
                                deck.push(Cards[i]);
                            }
                        }
                        else {
                            if(Cards[i].nom === "limit") {
                                for(var a = 0; a < 4; a++) {
                                    deck.push(Cards[i]);
                                }
                            }
                            if(Cards[i].nom === "feu_rouge"){
                                for(var a = 0; a < 5; a++) {
                                    deck.push(Cards[i]);
                                }
                            }
                        }

                    } // FIN ATTAQUE


                    if(Cards[i].type === "Parade") {
                        if(Cards[i].nom !== "feu_vert") {
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


                    if(Cards[i].type === "Distance") {
                        if(Cards[i].nom === "25km" || Cards[i].nom === "50km" || Cards[i].nom === "75km") {
                            for(var a = 0; a < 10; a++) {
                                deck.push(Cards[i]);
                            }
                        }
                        else {
                            if(Cards[i].nom === "100km") {
                                for(var a = 0; a < 12; a++) {
                                    deck.push(Cards[i]);
                                }
                            }
                            if(Cards[i].nom === "200km") {
                                for(var a = 0; a < 4; a++) {
                                    deck.push(Cards[i]);
                                }
                            }
                        }

                    } // FIN DISTANCE


                }
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
            catch (e){
            }

        })
    })
};

var findCardsType = new Promise(function(resolve, reject){

    let Cards = Carte.find({}, function(err, cartesRetour) {
        if(err) throw err;
    }).lean();

    resolve(Cards);
});

module.exports = { gameNamespace }
