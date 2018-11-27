'use strict';

function BlockE(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    hit = false;
    this.game.physics.arcade.enable(this);
}
BlockE.prototype = Object.create(Phaser.Sprite.prototype);
BlockE.constructor = BlockE;

BlockE.prototype.Collision = function (player) {
    hit = true;
}

module.exports = BlockE;