'use strict';

var Moneda = require('./Moneda.js');

function CoinSpawner(game, sprite) {
    //Propiedades
    this.game = game;
    this.sprite = sprite;
}
//Genera una moneda
CoinSpawner.prototype.Spawn = function (x, y) {
    return (new Moneda(this.game, x, y, this.sprite));
}

module.exports = CoinSpawner;
