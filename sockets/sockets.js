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
        // Récupération du deck
        var deck = await generateDeck();

        socket.emit('listPlayer', {players,deck});
        socket.broadcast.emit('listPlayer', {players,deck});
        console.log("Players : " + players.length)
        var result;
        // Distribution des cartes premier tour
        for (i = 0; i < playersIds.length; i++) {
            result = distributeCards(6, playersIds[i], deck);
        } 

        // Update du deck
        deck = result.deck;
        console.log("MAIN EN SORTIE : " + result.main.socketid);
        console.log("DECK EN SORTIE : " + result.deck.length);



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

        var res2 = {};
        playersIds = await getPlayersId();
        console.log(playersIds);
        for(var i=0; i< playersIds.length; i++) {
            user = await getUser(playersIds[i]);
            res2[user.socketid] = {
                name: user.name,
                score: user.score,
                socketid: user.socketid,
                player: user.player
            }
        }
        socket.broadcast.emit('listPlayer', res2);
    });
}

function distributeCards(numberCards, playerID, deck) {
        var cardsElt = [];
        console.log("ETAT DU DECK : " + deck);
        for(var i = 0; i < numberCards; i++)
        {
            cardsElt.push(deck[deck.length]);
            deck.pop();
            console.log("Nouvelle carte : --> " + deck[deck.length - 1].nom);
        }
        var main;
       main = {
            cards: cardsElt,
            number: cardsElt.length,
            socketid: playerID,
        }
        console.log("MAIN DU JOUEUR -> " + main.cards.length);
        console.log("JOUEUR LIE : " + main.socketid);
        var result = {main : main
                     ,deck : deck};
        return(result);
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
                let countDistance = 0;
                let countBotte = 0;
                let countParade = 0;
                let countAttaque = 0;
                for(i = 0; i < deck.length; i++) {
                    if(deck[i].type === "Distance") {

                        countDistance++;
                    }

                    if(deck[i].type === "Botte") {

                        countBotte++;
                    }

                    if(deck[i].type === "Parade") {

                        countParade++;
                    }

                    if(deck[i].type === "Attaque") {

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
            catch (e){
            }

        })
    })
}

var findCardsType = new Promise(function(resolve, reject){

    let Cards = Carte.find({}, function(err, cartesRetour) {
        if(err) throw err;
    }).lean();

    resolve(Cards);
});

module.exports = { gameNamespace }