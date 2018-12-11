'use strict';

function Checkpoint(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
}
Checkpoint.prototype = Object.create(Phaser.Sprite.prototype);
Checkpoint.constructor = Checkpoint;

//Guarda la posición de reaparición de Mario
Checkpoint.prototype.Collision = function (player) {
    player.spawnX = this.x;
    player.spawnY = this.y;
    this.frame = 1;
    //Sonido de la bandera
}

module.exports = Checkpoint;
