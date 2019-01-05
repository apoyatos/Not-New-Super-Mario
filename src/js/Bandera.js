'use strict';

function Checkpoint(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(2, 2);
    //Sonido
    this.flagSound = this.game.add.audio('checkpoint');
}
Checkpoint.prototype = Object.create(Phaser.Sprite.prototype);
Checkpoint.constructor = Checkpoint;

//Guarda la posición de reaparición de Mario
Checkpoint.prototype.Collision = function (player) {
    if (this.frame != 1) {
        player.spawnX = this.x;
        player.spawnY = this.y - 64;
        this.flagSound.play();
        this.frame = 1;
    }
}

module.exports = Checkpoint;
