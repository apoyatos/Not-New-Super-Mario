'use strict';

function BlockE(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.hit = false;
    this.frame=0;
    this.game.physics.arcade.enable(this);
    this.body.inmovable=true;
    this.body.moves=false;
}
BlockE.prototype = Object.create(Phaser.Sprite.prototype);
BlockE.constructor = BlockE;

BlockE.prototype.Collision = function (player) {
    this.hit = true;
    this.frame=1;
}

module.exports = BlockE;