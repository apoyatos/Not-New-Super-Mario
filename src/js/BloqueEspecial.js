'use strict';

function BlockE(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.hit = false;
    this.frame=1;
    this.game.physics.arcade.enable(this);
    this.body.inmovable=true;
    this.body.moves=false;
}
BlockE.prototype = Object.create(Phaser.Sprite.prototype);
BlockE.constructor = BlockE;

BlockE.prototype.Collision = function (player) {
    if ((player.y + player.height <= this.y && player.bombJump) || (player.y >= this.y + this.height))
    {
        this.hit = true;
        this.frame=0;
    }
}

module.exports = BlockE;