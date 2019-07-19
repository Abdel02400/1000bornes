var server = require('../server.js');
var app = require('../server.js');
let Carte = require('../models/carte.js');

module.exports = { ajoutCarte: function(){
  Carte.find({}, function(err, cartes) {
    if (err) throw err;

    // Check CardBase
    if(cartes == undefined || cartes.length == 0) {
      // Si la base est vide on ajoute toutes les cartes

      // Carte Distance (Modele)
      let km25 = Carte({
        nom: '25km',
        type: 'Distance',
        url: './images/cartes/25km.png'
      });
      let km50 = Carte({
        nom: '50km',
        type: 'Distance',
        url: './images/cartes/50km.png'
      });
      let km75 = Carte({
        nom: '75km',
        type: 'Distance',
        url: './images/cartes/75km.png'
      });
      let km100 = Carte({
        nom: '100km',
        type: 'Distance',
        url: './images/cartes/100km.png'
      });
      let km200 = Carte({
        nom: '200km',
        type: 'Distance',
        url: './images/cartes/200km.png'
      });

      // Carte Botte (Modele)

      let increvable = Carte({
        nom: 'increvable',
        type: 'Botte',
        url: './images/cartes/increvable.png'
      });

      let as_volant = Carte({
        nom: 'as_volant',
        type: 'Botte',
        url: './images/cartes/as_volant.png'
      });

      let citerne = Carte({
        nom: 'citerne',
        type: 'Botte',
        url: './images/cartes/citerne.png'
      });

      let prioritaire = Carte({
        nom: 'prioritaire',
        type: 'Botte',
        url: './images/cartes/prioritaire.png'
      });

      // Carte Attaque (Modele)

      let panne = Carte({
        nom: 'panne',
        type: 'Attaque',
        url: './images/cartes/panne.png'
      });

      let limit = Carte({
        nom: 'limit',
        type: 'Attaque',
        url: './images/cartes/limit.png'
      });

      let feu_rouge = Carte({
        nom: 'feu_rouge',
        type: 'Attaque',
        url: './images/cartes/feu_rouge.png'
      });

      let accident = Carte({
        nom: 'accident',
        type: 'Attaque',
        url: './images/cartes/accident.png'
      });

      let crevaison = Carte({
        nom: 'crevaison',
        type: 'Attaque',
        url: './images/cartes/crevaison.png'
      });

      // Carte Parade (Modele)

      let essence = Carte({
        nom: 'essence',
        type: 'Parade',
        url: './images/cartes/essence.png'
      });

      let fin_limit = Carte({
        nom: 'fin_limit',
        type: 'Parade',
        url: './images/cartes/fin_limit.png'
      });

      let feu_vert = Carte({
        nom: 'feu_vert',
        type: 'Parade',
        url: './images/cartes/feu_vert.png'
      });

      let reparations = Carte({
        nom: 'reparations',
        type: 'Parade',
        url: './images/cartes/crevaison.png'
      });

      let roue = Carte({
        nom: 'roue',
        type: 'Parade',
        url: './images/cartes/roue.png'
      });


      // Carte Distance (Save)

      km25.save(function(err) {
        if (err) throw err;
        console.log('km25 saved');
      });

      km50.save(function(err) {
        if (err) throw err;
        console.log('km50 saved');
      });

      km75.save(function(err) {
        if (err) throw err;
        console.log('km75 saved');
      });

      km100.save(function(err) {
        if (err) throw err;
        console.log('km100 saved');
      });

      km200.save(function(err) {
        if (err) throw err;
        console.log('km200 saved');
      });

      // Carte Botte (Save)

      increvable.save(function(err) {
        if (err) throw err;
        console.log('increvable saved');
      });

      as_volant.save(function(err) {
        if (err) throw err;
        console.log('as_volant saved');
      });

      citerne.save(function(err) {
        if (err) throw err;
        console.log('citerne saved');
      });

      prioritaire.save(function(err) {
        if (err) throw err;
        console.log('prioritaire saved');
      });

      // Carte Attaque (Save)

      panne.save(function(err) {
        if (err) throw err;
        console.log('panne saved');
      });

      limit.save(function(err) {
        if (err) throw err;
        console.log('limit saved');
      });

      feu_rouge.save(function(err) {
        if (err) throw err;
        console.log('feu_rouge saved');
      });

      accident.save(function(err) {
        if (err) throw err;
        console.log('accident saved');
      });

      crevaison.save(function(err) {
        if (err) throw err;
        console.log('crevaison saved');
      });

      // Carte Parade (Save)

      essence.save(function(err) {
        if (err) throw err;
        console.log('essence saved');
      });

      fin_limit.save(function(err) {
        if (err) throw err;
        console.log('fin_limit saved');
      });

      feu_vert.save(function(err) {
        if (err) throw err;
        console.log('feu_vert saved');
      });

      reparations.save(function(err) {
        if (err) throw err;
        console.log('reparations saved');
      });

      roue.save(function(err) {
        if (err) throw err;
        console.log('roue saved');
      });


      console.log('Cartes sauvegardées avec succès');

    }
    else {
      // Suppression Cartes
     /* Carte.deleteMany(function(err) {
        if(err) throw err;

        console.log('Cartes Supprimées');
      }); */
      console.log("tout les cartes sont présentes actuellement");
    }
  }
  )}
}
