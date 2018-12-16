'use strict';

var Enemy = require('./Enemigo.js');

function Fireplant(game, x, y, sprite, frame, shootSpeed, shootTime) {
    Enemy.call(this, game, x, y, sprite, frame, shootSpeed, shootTime);
    //Disparo
    this.angleShoot = 0;
    //Animaciones
    this.animations.add('shoot1', [9, 8], 5, false);
    this.animations.add('shoot2', [7, 6], 5, false);
    this.animations.add('shoot3', [5, 4], 5, false);
    this.animations.add('shoot4', [3, 2], 5, false);
    this.animations.add('shoot5', [1, 0], 5, false);
    //Tipo
    this.type = sprite;
}
Fireplant.prototype = Object.create(Enemy.prototype);
Fireplant.constructor = Fireplant;

//Disparo de la planta
Fireplant.prototype.Shoot = function (target) {
    if (!target.cappyPlant) //Si no se ha comido a Cappy dispara
    {
        var shot = this.EnemyShoot(target, 'fireball', this);
        this.Angle(target);
        return shot;
    }
    else
        this.frame = 5;
}
//Ángulo de disparo para animaciones
Fireplant.prototype.Angle = function (target) {
    this.angleShoot = Math.abs((this.game.physics.arcade.angleBetween(this, target) * 180) / Math.PI);
    if (this.angleShoot <= 36)
        return this.animations.play('shoot1');
    else if (this.angleShoot <= 36 * 2)
        return this.animations.play('shoot2');
    else if (this.angleShoot <= 36 * 3)
        return this.animations.play('shoot3');
    else if (this.angleShoot <= 36 * 4)
        return this.animations.play('shoot4');
    else
        return this.animations.play('shoot5');
}

module.exports = Fireplant;
