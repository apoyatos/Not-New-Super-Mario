'use strict';

var Shot = require('./shot.js');

function Enemy(game, x, y, sprite, frame, speed, moving, shooting) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);

  this.speed = speed;
  this.moving = moving;
  this.shooting = shooting;
  this.timeMoving = 0;
  this.timeShooting = 0;

  this.game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.body.gravity.y = speed * 5;
}
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.constructor = Enemy;

Enemy.prototype.AddAnimation = function (name, frames, speed) {
  this.animations.add(name, frames, speed, true);
}
Enemy.prototype.Move = function () {
  if(this.timeMoving < this.moving) {
    this.timeMoving++;
    this.body.velocity.x = this.speed;
    this.animations.play('walk');
  }
  else {
    this.time = 0;
    this.speed = -this.speed;
  }
}
Enemy.prototype.Shoot = function () {
  if(this.timeShooting < this.shooting)
    this.timeShooting++;
  else {
    var shot = new Shot(this.game, this.x, this.y, 'shot', 0);
    this.game.world.addChild(shot);
    shot.scale.setTo( 2, 2);
    shot.AddAnimation('shoot', [0, 1, 2, 3], 5);
    shot.Shoot();
    this.timeShooting = 0;
  }
}

module.exports = Enemy;
