'use strict';

function Shot(game, x, y, sprite, frame, animName, animFrames, animSpeed) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Disparo
  this.shotSpeed;
  this.velX = 0;
  this.velY = 0;
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.allowGravity = false;
  this.scale.setTo(2, 2);
  //Sonidos
  this.fireballSound = this.game.add.audio('fireball');
  //Sprite y animaciones
  this.sprite = sprite;
  this.animName = animName;
  this.animations.add(this.animName, animFrames, animSpeed, true);
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.constructor = Shot;

//Disparo
Shot.prototype.Shoot = function (target, speed) {
  //Mueve el disparo
  this.shotSpeed = speed;
  this.game.physics.arcade.moveToObject(this, target, speed);
  //Animación y sonido del disparo
  this.animations.play(this.animName);
  this.fireballSound.play();

}
//Destrucción del disparo
Shot.prototype.RemoveShot = function () {
  //Destruye el disparo si sale de la pantalla
  if (this.x < this.game.camera.x || this.x > this.game.camera.x + this.game.camera.width || this.y < this.game.camera.y || this.y > this.game.camera.y + this.game.camera.height)
    this.destroy();
}
//Destrucción del disparo si choca con Mario
Shot.prototype.Collision = function (player) {
  this.destroy();
  player.Hurt();
}
//Destrucción del disparo si choca con Mario goomba
Shot.prototype.GoombaCollision = function () {
  this.Collision();
}

module.exports = Shot;
