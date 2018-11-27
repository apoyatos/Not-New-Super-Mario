'use strict';

function Block( game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
}
Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.constructor = Block;

module.exports=Block;