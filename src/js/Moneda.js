'use strict';

function Moneda(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
}
Moneda.prototype = Object.create(Phaser.Sprite.prototype);
Moneda.constructor = Moneda;

//Colisión con Mario
Moneda.prototype.Collision = function (player) {
    player.coins++;
    this.kill();
}

module.exports = Moneda;