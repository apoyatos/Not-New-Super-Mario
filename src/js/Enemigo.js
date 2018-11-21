'use strict';

var Shot = require('./Disparo.js');

function Enemy(game, x, y, sprite, frame, shootingSpeed, shootingTime) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Disparo
  this.shootingSpeed = shootingSpeed;
  this.shootingTime = shootingTime;
  this.shootingTimer = 1;
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
  if (enemy.game.time.totalElapsedSeconds() > enemy.timeShooting) {
    //Crea el disparo
    if (sprite == 'disparo-fuego') {
      var shot = new Shot(enemy.game, enemy.x, enemy.y, sprite, 0, 'shootFire', [0, 1, 2, 3], 5);
      shot.Shoot(target, enemy.shootingVel);
      enemy.timeShooting = enemy.game.time.totalElapsedSeconds() + enemy.shooting;
    }
    else {
      //
    }
    //Destruye el disparo si sale de la pantalla
    shot.checkWorldBounds = true;
    shot.events.onOutOfBounds.add(shot.RemoveShot, shot);
    return shot;
  }
}

module.exports = Enemy;
