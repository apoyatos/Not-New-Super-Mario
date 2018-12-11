'use strict';

function Shot(game, x, y, sprite, frame, animName, animFrames, animSpeed) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Dirección
  this.posX;
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.allowGravity = false;
  //Sonidos
  this.fireballSound = this.game.add.audio('fireball');
  //Sprite y animaciones
  this.scale.setTo(2, 2);
  this.sprite = sprite;
  this.animName = animName;
  this.animations.add(this.animName, animFrames, animSpeed, true);
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.constructor = Shot;

//Disparo
Shot.prototype.Shoot = function (target, speed) {
  this.game.physics.arcade.moveToObject(this, target, speed);
  this.animations.play(this.animName);
  if (this.sprite == 'fireball')
    this.fireballSound.play();
}
//Destrucción
Shot.prototype.RemoveShot = function () {
  if (this.x < this.game.camera.x || this.x > this.game.camera.x + this.game.camera.width || this.y < this.game.camera.y || this.y > this.game.camera.y + this.game.camera.height)
    this.destroy();
}

module.exports = Shot;
