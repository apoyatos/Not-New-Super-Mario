'use strict';

var Disparo = require('./Disparo.js');

function Enemy(game, x, y, sprite, frame, shootSpeed, shootTime) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);
  //Disparo
  this.shootSpeed = shootSpeed;
  this.shootTime = shootTime;
  this.shootTimer = 0;
  //Propiedades
  this.game.world.addChild(this);
  this.game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.body.gravity.y = 600;
  this.scale.setTo(2, 2);
}
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.constructor = Enemy;

//Disparo de enemigo
Enemy.prototype.EnemyShoot = function (target, sprite, enemy) {
  if (enemy.game.time.totalElapsedSeconds() > this.shootTimer) {
    //Crea el disparo
    var shot = new Disparo(enemy.game, enemy.x, enemy.y, sprite, 0, 'fireball', [0, 1, 2, 3], 5);
    //Lo dispara
    shot.Shoot(target, enemy.shootSpeed);
    this.shootTimer = enemy.game.time.totalElapsedSeconds() + this.shootTime;
    return shot;
  }
}
//Reset de enemigo
Enemy.prototype.Reset = function (x, y) {
  this.reset(x, y);
}
//Daña a Mario con enemigo capturado
Enemy.prototype.Collision = function (player) {
  player.Hurt();
}
Enemy.prototype.GoombaCollision = function (player) {
  this.Collision();
}
//Recalcula la caja de colisión
Enemy.prototype.Recalculate = function (player) {
  player.body.height = player.height;
  player.body.width = player.width;
}
//Metodos polimorficos
Enemy.prototype.Move = function () { }
Enemy.prototype.Attack = function (player) { }
Enemy.prototype.Hurt = function () { }
Enemy.prototype.Shoot = function (player) { }

module.exports = Enemy;
