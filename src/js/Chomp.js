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
    this.chain = chain;
    this.distance = distance;
    this.originalSpeed = speed;
    this.originX = x;
    //Acciones
    this.attack = false;
    this.charging = false;
    //Temporizadores
    this.cooldown = cooldown;
    this.cooldownTimer = 0;
    this.chargeTime = 1;
    this.chargeTimer = 0;
    //Sprites y animaciones
    this.scale.setTo(2.5, 2.5);
    this.animations.add('walkLeft', [0, 1, 4, 1, 0], 5, true);
    this.animations.add('walkRight', [3, 2, 7, 2, 3], 5, true);
    this.originalHeight = this.body.height * this.scale.x;
}
Chomp.prototype = Object.create(Enemy.prototype);
Chomp.constructor = Chomp

//Movimiento
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
//Ataque
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
    if ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == 1) {
        player.body.velocity.x = player.velocity / 4;
        this.charged = false;
        this.charging = false;
    }
    else if ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == -1) {
        player.body.velocity.x = -player.velocity / 4;
        this.charged = false;
    }
    else {
        player.body.velocity.x = 0;
        if (!this.charging && !this.charged) {
            this.chargeTimer = this.game.time.totalElapsedSeconds() + this.chargeTime;
            this.charging = true;
            this.charged = false;
        }
        else if (this.game.time.totalElapsedSeconds() > this.chargeTimer)
            this.charged = true;
    }
}
//Ausencia de movimiento capturado
Chomp.prototype.MarioNotMoving = function (player) {
    if (this.charged && ((player.x + player.velocity / 30 < (this.originX + this.chain) + 150) && player.facing == -1)) {
        player.body.velocity.x = 4 * player.velocity;
    }
    else if (this.charged && ((player.x - player.velocity / 30 > (this.originX - this.chain) - 150) && player.facing == 1)) {
        player.body.velocity.x = -4 * player.velocity;
    }
    else {
        player.body.velocity.x = 0;
        this.charged = false;
        this.charging = false;
    }
}
//Salto capturado
Chomp.prototype.MarioJump = function (player) {

}
//Colisiones capturado
Chomp.prototype.Collision = function (player, enemy) {
    if (this.game.physics.arcade.overlap(enemy, player) && !player.hurt) {
        player.Hurt();
        return true;
    }
    if (this.game.time.totalElapsedSeconds() > player.hurtTimer) {
        player.hurt = false;
        return false;
    }
}
Chomp.prototype.BlockCollision = function (tile, player) {
    if (this.charged) {
        player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks)
    }
}
Chomp.prototype.EBlockCollision = function (tile, prizeType) {
    if (tile.index == 2) {
        if (this.charged) {
            tile.index = 123;
            tile.layer.dirty = true;
            if (prizeType == 'coin')
                player.scene.collectibles.add(new Monedas(this.game, tile.worldX, tile.worldY + tile.height, this.coinSprite))
            else if (prizeType == 'heart')
                player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY - tile.height, this.heartSprite, 0, 3))
            else
                player.scene.collectibles.add(new Corazones(this.game, tile.worldX, tile.worldY - tile.height, this.heartSprite, 0, 6))
        }
    }
}
//Animaciones
Chomp.prototype.handleAnimations = function (player) {
    if (player.hurt) {
        if (!this.charged) {
            if (player.facing == -1)
                player.animations.play('hurtChompLeft');
            else
                player.animations.play('hurtChompRight');
        }
        else {
            if (player.facing == 1)
                player.animations.play('hurtChompLeft');
            else
                player.animations.play('hurtChompRight');
        }
    }
    else {
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
}

module.exports = Chomp;
