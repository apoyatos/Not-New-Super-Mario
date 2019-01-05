'use strict';

var Enemy = require('./Enemigo.js');

function Goomba(game, x, y, sprite, frame, speed, player) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.player = player;
    this.count = 1;
    //Movimiento
    this.speed = speed;
    //Sonidos
    this.killSound = this.game.add.audio('kill');
    //Animación
    this.animations.add('walk1', ['walkLeft1', 'walkRight1'], 5, true);
    this.animations.add('walk2', ['walkLeft2', 'walkRight2'], 5, true);
    this.animations.add('walk3', ['walkLeft3', 'walkRight3'], 5, true);
    this.animations.add('walk4', ['walkLeft4', 'walkRight4'], 5, true);
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
    //Tipo
    this.type = sprite;
}
Goomba.prototype = Object.create(Enemy.prototype);
Goomba.constructor = Goomba;

//Movimiento del goomba
Goomba.prototype.Move = function () {
    this.body.velocity.x = this.speed;
    if (this.count == 1)
        this.animations.play('walk1');
    else if (this.count == 2)
        this.animations.play('walk2');
    else if (this.count == 3)
        this.animations.play('walk3');
    else
        this.animations.play('walk4');
    this.recalculateBody();
}
//Cambia la dirección del goomba
Goomba.prototype.ChangeDir = function () {
    if (this.body.onWall())
        this.speed = -this.speed;
}
//Mario pisa al goomba
Goomba.prototype.Killed = function () {
    if (this.count == 1) //Muere si está solo
        this.Die();
    else //Pierde un miembro de la torre si son varios
    {
        this.count--;
        this.recalculateBody();
        this.y = this.y + this.height / (this.count + 1);
    }
    this.killSound.play();
    this.player.body.velocity.y = -this.player.jumpVelocity / 2;
    this.player.tackling = false;
    this.player.tackles = 1;
}
//Muerte del goomba
Goomba.prototype.Die = function () {
    this.kill();
    this.count = 1;
}
//Reset del goomba
Goomba.prototype.Reset = function (x, y, count) {
    this.reset(x, y);
    this.count = count;
}
//Movimiento del goomba capturado
Goomba.prototype.MarioMove = function (player) {
    if (!player.running)
        player.body.velocity.x = player.facing * player.velocity / 1.7;
    else
        player.body.velocity.x = player.facing * player.velocity / 1.5;
}
//Goomba capturado quieto
Goomba.prototype.MarioNotMoving = function (player) {
    player.body.velocity.x = 0;
}
//Salto del goomba capturado
Goomba.prototype.MarioJump = function (player) {
    player.body.velocity.y = -player.jumpVelocity / 1.7;
}
//Colisión del goomba
Goomba.prototype.Collision = function (player) {
    if (player.bottom < this.y + 10)
        this.Killed();
    else
        Enemy.prototype.Collision(player);
}
//Colisión del goomba con Mario goomba
Goomba.prototype.GoombaCollision = function (player) {
    if (player.bottom < this.y + 10 && player.goombaCount < 4) //Se sube en el goomba
    {
        player.goombaCount++;
        this.kill();
        player.recalculateBody();
    }
}
//Colisión de Mario goomba con enemigos
Goomba.prototype.MarioCollision = function (player, enemy) {
    enemy.GoombaCollision(player)
}
//Colisión de Mario goomba con bloqes
Goomba.prototype.BlockCollision = function (player, tile) { }
Goomba.prototype.EspecialBlockCollision = function (tile, prizeType) { }
//Animaciones de Mario goomba
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
//Recalcula la caja de colisiones del goomba
Goomba.prototype.recalculateBody = function () {
    this.body.height = this.height;
    this.body.width = this.width;
}

module.exports = Goomba;
