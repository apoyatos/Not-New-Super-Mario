'use strict';

var Enemy = require('./Enemigo.js');

function Planta(game, x, y, sprite, frame, shootingVel, shootingTime) {
    Enemy.call(this, game, x, y, sprite, frame, shootingVel, shootingTime);
    //Tipo
    this.type = sprite;
    this.ang = 0;
    //Sprites y animaciones
    this.scale.setTo(2.5, 2.5);
}
Planta.prototype = Object.create(Enemy.prototype);
Planta.constructor = Planta;

//Disparo
Planta.prototype.Shoot = function (target) {
    var shot=this.EnemyShoot(target, 'disparo-fuego', this);
    this.ang = Math.abs((this.game.physics.arcade.angleBetween(this, target)*180)/Math.PI);
    if (this.ang <= 36)
        this.frame = 4;
    else if (this.ang <= 36*2)
        this.frame = 3;
    else if (this.ang <= 36*3)
        this.frame = 2;
    else if (this.ang <= 36*4)
        this.frame = 1;
    else
        this.frame = 0;
    return shot;
}

module.exports = Planta;
