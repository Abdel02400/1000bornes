const mongoose = require('mongoose');
//const Carte = require('./models/carte.js');
const {game} = require('../config/config.js');
const redis = require('redis');

var redisClient = redis.createClient(6379, '127.0.0.1');
mongoose.connect(
    'mongodb://localhost:27017/qpuc', { useNewUrlParser:true }
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



        var res2 = {};
        var user = await getUser(id);
        playersIds = await getPlayersId();

        socket.emit('myProfil', user);

        for(var i=0; i< playersIds.length; i++) {
            user = await getUser(playersIds[i]);
            res2[user.socketid] = {
                name: user.name,
                score: user.score,
                socketid: user.socketid,
                player: user.player
            }
        }

        if(playersIds.length === 4) {
            socket.broadcast.emit('complete', true);
        }

        socket.emit('listPlayer', res2);
        socket.broadcast.emit('listPlayer', res2);


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

        /*redisClient.smembers('joueurs', (err, result) => {
            result.forEach(function(playerId) {
                if(playerId === id) {

                    redisClient.hgetall(playerId, (err, result) => {
                        nbplayer = result.player;
                    });

                    redisClient.del(playerId);
                    redisClient.srem('joueurs', playerId);
                }
            });

            redisClient.smembers("joueurs", (err, result) => {
                result.forEach(function(playerId) {
                    redisClient.hgetall(playerId, (err, result) => {
                        if(result.player > nbplayer){
                            var newResult = parseInt(result.player) -1;
                            redisClient.hset(playerId, 'player', newResult);
                        }
                    });
                })
            });
        });*/

        var res2 = {};
        playersIds = await getPlayersId();

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

module.exports = { gameNamespace }