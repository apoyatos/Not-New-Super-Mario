'use strict';

function Hearts(game, x, y, sprite, frame,amount) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.amount=amount;
}
Hearts.prototype = Object.create(Phaser.Sprite.prototype);
Hearts.constructor = Hearts;

Hearts.prototype.Collision = function (player) {
    player.life=amount;
    this.kill();
}

module.exports = Hearts;