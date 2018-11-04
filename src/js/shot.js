'use strict';

function Shot(game, x, y, sprite, frame) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);

  this.game.physics.arcade.enable(this);
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.constructor = Shot;

Shot.prototype.AddAnimation = function (name, frames, speed) {
  this.animations.add(name, frames, speed, true);
}
Shot.prototype.Shoot = function () {
    this.body.velocity.y = -100;
    this.animations.play('shoot');
}

module.exports = Shot;
