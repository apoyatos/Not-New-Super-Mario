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
    this.animations.add('walk', [0, 1], 5, true);
    this.originalHeight = this.body.height * this.scale.x;
}
Goomba.prototype = Object.create(Enemy.prototype);
Goomba.constructor = Goomba;

//Muerte
Goomba.prototype.Die = function () {
    if (this.game.physics.arcade.overlap(this, this.player) && this.player.y + this.player.height < this.y + 10 && !this.player.hurt && !this.player.capture) {
        this.kill();
        this.player.body.velocity.y = -this.player.jumpVelocity / 2;
        this.player.tackling = false;
        this.player.tackles = 1;
    }
}
//Movimiento capturado
Goomba.prototype.MarioMove = function (player) {
    if (!player.running)
        player.body.velocity.x = player.facing * player.velocity / 1.75;
    else
        player.body.velocity.x = player.facing * player.velocity;
}
//Ausencia de movimiento capturado
Goomba.prototype.MarioNotMoving = function (player) {
    player.body.velocity.x = 0;
}
//Salto capturado
Goomba.prototype.MarioJump = function (player) {
    player.body.velocity.y = -player.jumpVelocity / 1.5;
}
//Colisiones capturado
Goomba.prototype.Collision = function (player, enemy) {
    if (player.game.physics.arcade.overlap(enemy, player) && !player.hurt) //Si choca con un enemigo
    {
        if (enemy.type == 'goomba') //Si es un goomba
        {
            if (player.y + player.height < enemy.y + 10 && player.goombaCount < 4) //Se sube en el goomba
            {
                player.goombaCount++;
                enemy.kill();
                player.recalculateBody();
            }
            else //Se hace daño
            {
                player.Hurt();
                return true;
            }
        }
        else //Se hace daño
        {
            player.Hurt();
            return true;
        }
    }
    if (player.game.time.totalElapsedSeconds() > player.hurtTimer) {
        player.hurt = false;
        return false;
    }
}

Goomba.prototype.BlockCollision = function (player, tile) {

}
Goomba.prototype.EBlockCollision = function (tile, prizeType) {
}
//Animaciones
Goomba.prototype.handleAnimations = function (player) {
    if (player.hurt) //Si se hace daño
    {
        if (player.goombaCount == 1)
            player.animations.play('hurtGoomba1');
        else if (player.goombaCount == 2)
            player.animations.play('hurtGoomba2');
        else if (player.goombaCount == 3)
            player.animations.play('hurtGoomba3');
        else
            player.animations.play('hurtGoomba4');
    }
    else if (!player.moving) //Si no se mueve
    {
        if (player.goombaCount == 1)
            player.animations.play('idleGoomba1');
        else if (player.goombaCount == 2)
            player.animations.play('idleGoomba2');
        else if (player.goombaCount == 3)
            player.animations.play('idleGoomba3');
        else
            player.animations.play('idleGoomba4');
    }
    else //Si se mueve
    {
        if (player.goombaCount == 1)
            player.animations.play('walkGoomba1');
        else if (player.goombaCount == 2)
            player.animations.play('walkGoomba2');
        else if (player.goombaCount == 3)
            player.animations.play('walkGoomba3');
        else
            player.animations.play('walkGoomba4');
    }
}

module.exports = Goomba;
