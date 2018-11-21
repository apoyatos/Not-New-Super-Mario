'use strict';

var Enemy = require('./Enemigo.js');

function Goomba(game, x, y, sprite, frame, speed, movingTime, player) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.player = player;
    //Tipo
    this.type = sprite;
    //Movimiento
    this.speed = speed;
    this.movingTime = movingTime;
    this.movingTimer = 0;
    //Sprites y animaciones
    this.scale.setTo(2.5, 2.5);
    this.animations.add('walk', [0, 1], 5, true);
}
Goomba.prototype = Object.create(Enemy.prototype);
Goomba.constructor = Goomba;

//Movimiento
Goomba.prototype.Move = function () {
    if (this.game.time.totalElapsedSeconds() < this.movingTimer) {
        this.body.velocity.x = this.speed;
        this.animations.play('walk');
    }
    else {
        this.movingTimer = this.game.time.totalElapsedSeconds() + this.movingTime;
        this.speed = -this.speed;
        this.animations.play('walk');
    }
}
//Muerte
Goomba.prototype.Die = function () {
    if (this.game.physics.arcade.overlap(this, this.player) && this.player.y + this.player.height < this.y + this.height && !this.player.hurt) {
        this.kill();
        this.player.body.velocity.y = -this.player.jumpVelocity / 2;
        this.player.tackling = false;
        this.player.tackles = 1;
    }
}
//Movimiento capturado
Goomba.prototype.MarioMove = function (player) {
    player.body.velocity.x = player.facing * player.velocity;
    player.animations.play('walkGoomba');
}
//Ausencia de movimiento capturado
Goomba.prototype.MarioNotMoving = function (player) {
    player.body.velocity.x = 0;
    player.animations.play('idleGoomba')
}
//Salto capturado
Goomba.prototype.MarioJump = function (player) {
    player.body.velocity.y = -player.jumpVelocity / 2;
}

module.exports = Goomba;
