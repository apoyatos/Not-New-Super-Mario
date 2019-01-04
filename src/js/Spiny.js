'use strict';

var Enemy = require('./Enemigo.js');

function Spiny(game, x, y, sprite, frame, speed) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Movimiento
    this.speed = speed;
    //Animaciones
    this.animations.add('walkLeft', [0, 1], 5, true);
    this.animations.add('walkRight', [2, 3], 5, true);
    //Tipo
    this.type = sprite;
}
Spiny.prototype = Object.create(Enemy.prototype);
Spiny.constructor = Spiny;

//Movimiento del spiny
Spiny.prototype.Move = function () {
    this.body.velocity.x = this.speed;
    //Animaciones
    if (this.body.velocity.x < 0)
        this.animations.play('walkLeft');
    else
        this.animations.play('walkRight');
}
//Cambia la dirección
Spiny.prototype.ChangeDir = function () {
    if (this.body.onWall())
        this.speed = -this.speed;
}
//Muerte del spiny
Spiny.prototype.Die = function () {
    this.kill();
}

module.exports = Spiny;
