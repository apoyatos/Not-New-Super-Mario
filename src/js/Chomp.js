'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    //Tipo
    this.type = sprite;
    //Movimiento
    this.speed = speed;
    this.chain = chain;
    this.originX = x;
    this.distance = distance
    //Sprites y animaciones
    this.originalHeight = this.body.height * this.scale.x;
}
Chomp.prototype = Object.create(Enemy.prototype);
Chomp.constructor = Chomp

Chomp.prototype.Move = function () {
    if ((this.x+this.speed > (this.originX + this.chain)) || (this.x+this.speed < (this.originX - this.chain)))
        this.speed = -this.speed;
    this.body.velocity.x = this.speed;
}

Chomp.prototype.Attack = function (player) {
    if (Math.sign(this.speed) == -player.facing && Math.abs(player.x - this.x) < this.distance)
        this.x = this.originX + this.chain * (-player.facing);

}

module.exports = Chomp;