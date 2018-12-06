'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance, cooldown) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.charged = false;
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
    this.animations.add('walkLeft', [0, 1, 4, 1, 0], 5, true);
    this.animations.add('walkRight', [3, 2, 7, 2, 3], 5, true);
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
        if (this.speed < 0)
            this.animations.play('walkLeft');
        else
            this.animations.play('walkRight');
    }
    else
        this.body.velocity.x = 0;

}

Chomp.prototype.Attack = function (player) {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if (!this.attack && (Math.sign(this.speed) == Math.sign(player.x - this.x) && Math.abs(player.x - this.x) < this.distance)) {
            this.x = this.originX + this.chain * Math.sign(-this.speed);
            this.speed = 4 * this.speed;
            this.attack = true;
        }
    }

}

//Movimiento capturado
Chomp.prototype.MarioMove = function (player) {
    console.log(player.facing)
    if ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == 1) {
        player.body.velocity.x = player.velocity / 2;
        this.charged = false;
    }
    else if ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == -1) {
        player.body.velocity.x = -player.velocity / 2;
        this.charged = false;
    }
    else {
        player.body.velocity.x = 0;
        this.charged = true;
    }

}
//Ausencia de movimiento capturado
Chomp.prototype.MarioNotMoving = function (player) {
    console.log(this.charged);
    if (this.charged && ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == -1)) {
        player.body.velocity.x = 2 * player.velocity;
    }
    else if (this.charged && ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == 1)) {
        player.body.velocity.x = -2 * player.velocity;
    }
    else {
        player.body.velocity.x = 0;
        this.charged = false;
    }
}
//Salto capturado
Chomp.prototype.MarioJump = function (player) {

}
//Colisiones capturado
Chomp.prototype.Collision = function (player, enemy) {
}

Chomp.prototype.handleAnimations = function (player) {
    if (!this.charged) {
        if (player.facing == -1)
            player.animations.play('walkChompLeft');
        else
            player.animations.play('walkChompRight');
    }
    else {
        if (player.facing == 1)
            player.animations.play('walkChompLeft');
        else
            player.animations.play('walkChompRight');
    }

}

module.exports = Chomp;