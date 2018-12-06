'use strict';

function Corazon(game, x, y, sprite, frame, amount) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Cantidad de vida
    this.amount = amount;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
}
Corazon.prototype = Object.create(Phaser.Sprite.prototype);
Corazon.constructor = Corazon;

//Colisión con Mario
Corazon.prototype.Collision = function (player) {
    player.life = amount;
    this.kill();
}

module.exports = Corazon;
