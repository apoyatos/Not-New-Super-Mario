'use strict';

function Bandera(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2.25,2.5);
}
Bandera.prototype = Object.create(Phaser.Sprite.prototype);
Bandera.constructor = Bandera;

//Colisión con Mario
Bandera.prototype.Collision = function (player) {
    player.spawnX = this.x;
    player.spawnY = this.y;
    this.frame=1;
}

module.exports = Bandera;
