'use strict';

function Moon(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.physics.arcade.enable(this);
}
Moon.prototype = Object.create(Phaser.Sprite.prototype);
Moon.constructor = Moon;

Moon.prototype.Collision = function (player) {
    player.moons++;
    console.log("Lunas: " + player.moons);
    this.kill();
}

module.exports = Moon;