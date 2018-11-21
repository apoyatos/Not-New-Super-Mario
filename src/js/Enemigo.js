'use strict';

var Shot = require('./Disparo.js');

function Enemy(game, x, y, sprite, frame, shootingSpeed, shootingTime) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Disparo
  this.shootingSpeed = shootingSpeed;
  this.shootingTime = shootingTime;
  this.shootingTimer = 0;
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.body.gravity.y = 500;
}
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.constructor = Enemy;

//Disparo
Enemy.prototype.EnemyShoot = function (target, sprite, enemy) {
  if (enemy.game.time.totalElapsedSeconds() > this.shootingTimer) {
    //Crea el disparo
    if (sprite == 'disparo-fuego') {
      var shot = new Shot(enemy.game, enemy.x, enemy.y, sprite, 0, 'shootFire', [0, 1, 2, 3], 5);
      shot.Shoot(target, enemy.shootingVel);
      this.shootingTimer = enemy.game.time.totalElapsedSeconds() + this.shootingTime;
      return shot;
    }
    else {
      //
    }
  }
}

module.exports = Enemy;
