'use strict';

var Enemy = require('./Enemigo.js');

function Planta(game, x, y, sprite, frame, player) {
    Enemy.call(this, game, x, y, sprite, frame, 200, 0);
    //Mario
    this.player = player;
    //Tipo
    this.type = sprite;
    //Sprites y animaciones
    this.scale.setTo(2.5, 2.5);
}
Planta.prototype = Object.create(Enemy.prototype);
Planta.constructor = Planta;

//Disparo
Planta.prototype.Shoot = function () {
    Enemy.prototype.EnemyShoot(this.player, 'disparo-fuego', this);
    /*this.rotation = this.game.physics.arcade.angleBetween(this, this.player);
    if (this.rotation <= 36)
        this.frame = 0;
    else if (this.rotation <= 36 * 2)
        this.frame = 1;
    else if (this.rotation <= 36 * 3)
        this.frame = 2;
    else if (this.rotation <= 36 * 4)
        this.frame = 3;
    else
        this, this.frame = 4;*/
}

module.exports = Planta;
