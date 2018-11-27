'use strict';

function Coins( game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
}
Coins.prototype = Object.create(Phaser.Sprite.prototype);
Coins.constructor = Coins;

module.exports=Coins;