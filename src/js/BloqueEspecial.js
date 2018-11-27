'use strict';

function BlockE( game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
}
BlockE.prototype = Object.create(Phaser.Sprite.prototype);
BlockE.constructor = BlockE;

module.exports=BlockE;