'use strict';

function Coins(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
}
Coins.prototype = Object.create(Phaser.Sprite.prototype);
Coins.constructor = Coins;

Coins.prototype.Collision = function (player) {
    player.coins++;
    console.log("Monedas: " + player.coins);
    this.kill();
}

module.exports = Coins;