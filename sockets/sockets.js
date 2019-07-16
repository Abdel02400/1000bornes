const mongoose = require('mongoose');
//const Carte = require('./models/carte.js');
const {game} = require('../config/config.js');
const redis = require('redis');

var gameNamespace = (socket) => {
    socket.emit('message','Bienvenue sur le jeux de 1000 bornes');


    var getListId = () => {
        return new Promise((resolve, reject) => {
            redisClient.smembers("candidats", (err, result) => {
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

    socket.on('addPlayer', async (data) => {

        var res = socket.id.split('#');
        var id = res[1];

        /*var res = socket.id.split('#');
        var id = res[1];
        redisClient.sadd('candidats', id);
        redisClient.hmset(id, "name", data, "socketid", id, "score", 0);

        var res2 = {

        };

        var test = [];

        var listIds = await getListId();

        for(var i=0; i<listIds.length;i++) {

            var user = await getUser(id);
            var player = user.socketid;


            res2[player] = {
                name: user.name,
                score: user.score
            }
            test.push(res2);
        }

        socket.emit('getPlayers', test);
        socket.broadcast.emit('getPlayers', test);*/

    });

    socket.on('disconnect', () => {
        /*var socketIdGone = socket.id;
        var socketIdPropre = socketIdGone.split('#')[1];
        socket.broadcast.emit('playerGone', socketIdPropre);
        socket.emit('playerGone', socketIdPropre);
        // DELETE DE REDIS ICI
        redisClient.smembers('candidats', (err, result) => {
            result.forEach(function(player) {
                redisClient.hget(player.socketid, (err, result) => {
                    if(result == socketIdGone) {
                        redisClient.del(player);
                        redisClient.srem('candidats', player);
                    }
                });
            });
        });*/
    });
}

module.exports = { gameNamespace }