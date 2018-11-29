'use strict';

function Block(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.inmovable=true;
    this.body.moves=false;
}
Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.constructor = Block;

Block.prototype.Collision = function (player) {
    if ((player.y + player.height <= this.y && player.bombJump) || (player.y >= this.y + this.height))
        this.kill();
}

module.exports = Block;