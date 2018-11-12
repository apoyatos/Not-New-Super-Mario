'use strict';

function Shot(game, x, y, sprite, frame) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);

  this.game.physics.arcade.enable(this);
  this.body.allowGravity = false;
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.constructor = Shot;

Shot.prototype.AddAnimation = function (name, frames, speed) {
  this.animations.add(name, frames, speed, true);
  return name;
}
Shot.prototype.Shoot = function (target, speed, anim) {
    this.game.physics.arcade.moveToObject(this, target, speed);
    this.animations.play(anim);
}
Shot.prototype.RemoveShot = function () {
  this.destroy();
}

module.exports = Shot;
