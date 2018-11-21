'use strict';

function Shot(game, x, y, sprite, frame, animName, animFrames, animSpeed) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.allowGravity = false;
  //Sprite y animaciones
  this.animName = animName;
  this.scale.setTo(2, 2);
  this.animations.add(this.animName, animFrames, animSpeed, true);
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.constructor = Shot;

//Disparo
Shot.prototype.Shoot = function (target, speed) {
  this.game.physics.arcade.moveToObject(this, target, speed);
  this.animations.play(this.animName);
}
//Destrucción
Shot.prototype.RemoveShot = function () {
  if(this.inCamera)
    this.destroy();
}

module.exports = Shot;
