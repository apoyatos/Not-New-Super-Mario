'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance, cooldown) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    //Tipo
    this.type = sprite;
    //Movimiento
    this.speed = speed;
    this.originalSpeed = speed;
    this.chain = chain;
    this.originX = x;
    this.distance = distance;
    this.attack = false;
    this.cooldownTimer = 0;
    this.cooldown = cooldown;
    //Sprites y animaciones
    this.originalHeight = this.body.height * this.scale.x;

}
Chomp.prototype = Object.create(Enemy.prototype);
Chomp.constructor = Chomp

Chomp.prototype.Move = function () {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if ((this.x + this.speed / 30 > (this.originX + this.chain)) || (this.x + this.speed / 30 < (this.originX - this.chain))) {
            if (this.attack) {
                this.speed = this.originalSpeed * Math.sign(this.speed);
                this.attack = false;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + this.cooldown;
            }
            this.speed = -this.speed;

        }
        this.body.velocity.x = this.speed;
    }
    else
        this.body.velocity.x = 0;

}

Chomp.prototype.Attack = function (player) {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if (!this.attack && (Math.sign(this.speed) == Math.sign(player.x - this.x) && Math.abs(player.x - this.x) < this.distance)) {
            this.x = this.originX + this.chain * Math.sign(-this.speed);
            this.speed = 3 * this.speed;
            this.attack = true;
        }
    }

}

module.exports = Chomp;