'use strict';

var Corazon = require('./Corazon.js');

function HeartSpawner(game, sprite, amount) {
    //Propiedades
    this.game = game;
    this.sprite = sprite;
    this.amount = amount;
}
//Genera un corazón
HeartSpawner.prototype.Spawn = function (x, y) {
    return new Corazon(this.game, x, y, this.sprite, this.amount);
}

module.exports = HeartSpawner;
