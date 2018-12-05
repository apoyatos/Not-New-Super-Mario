'use strict';

function Checkpoints(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
}
Checkpoints.prototype = Object.create(Phaser.Sprite.prototype);
Checkpoints.constructor = Checkpoints;

Checkpoints.prototype.Collision = function (player) {
    player.spawnX=this.x;
    player.spawnY=this.y;
    this.kill();
}

module.exports = Checkpoints;