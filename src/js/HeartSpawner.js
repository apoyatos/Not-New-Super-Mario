'use strict';

var Corazon = require('./Corazon.js');

function HeartSpawner(game, heartSprite, amount) {
    //Propiedades
    this.game = game;
    this.sprite = heartSprite;
    this.life = amount;
}
//Genera un corazón
HeartSpawner.prototype.Spawn = function (x, y) {
    return new Corazon(this.game, x, y, this.sprite, this.life);
}

module.exports = HeartSpawner;
