'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance, cooldown) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.charged = false;
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
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
    //Animaciones
    this.animations.add('walkLeft', [0, 1, 4, 1, 0], 5, true);
    this.animations.add('walkRight', [3, 2, 7, 2, 3], 5, true);
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
    //Tipo
    this.type = sprite;
}
Chomp.prototype = Object.create(Enemy.prototype);
Chomp.constructor = Chomp

//Movimiento del chomp
Chomp.prototype.Move = function () {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if ((this.x + this.speed / 30 > (this.originX + this.chain)) || (this.x + this.speed / 30 < (this.originX - this.chain))) //Si está en el area de la cadena
        {
            if (this.attack) //Ataque cargando contra Mario
            {
                this.speed = this.originalSpeed * Math.sign(this.speed);
                this.attack = false;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + this.cooldown;
            }
            this.speed = -this.speed;
        }
        this.body.velocity.x = this.speed;
        //Animaciones
        if (this.speed < 0)
            this.animations.play('walkLeft');
        else
            this.animations.play('walkRight');
    }
    else
        this.body.velocity.x = 0;
}
//Ataque del chomp
Chomp.prototype.Attack = function (player) {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        if (!this.attack && (Math.sign(this.speed) == Math.sign(player.x - this.x) && Math.abs(player.x - this.x) < this.distance)) //Si Mario está en rango ataca
        {
            this.x = this.originX + this.chain * Math.sign(-this.speed);
            this.speed = 4 * this.speed;
            this.attack = true;
        }
    }
}
//Movimiento del chomp capturado
Chomp.prototype.MarioMove = function (player) {
    if ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == 1) //Movimiento hacia la derecha
    {
        player.body.velocity.x = player.velocity / 3;
        this.charged = false;
        this.charging = false;
    }
    else if ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == -1) //Movimiento hacia la izquierda
    {
        player.body.velocity.x = -player.velocity / 3;
        this.charged = false;
    }
    else {
        player.body.velocity.x = 0;
        if (!this.charging && !this.charged) //Carga el ataque
        {
            this.chargeTimer = this.game.time.totalElapsedSeconds() + this.chargeTime;
            this.charging = true;
            this.charged = false;
        }
        else if (this.game.time.totalElapsedSeconds() > this.chargeTimer) //Ataca
            this.charged = true;
    }
}
//Chomp capturado quieto o atacando
Chomp.prototype.MarioNotMoving = function (player) {
    if (this.charged && ((player.x + player.velocity / 30 < (this.originX + this.chain) + 150) && player.facing == -1)) //Movimiento cargado hacia la derecha
    {
        player.body.velocity.x = 4 * player.velocity;
    }
    else if (this.charged && ((player.x - player.velocity / 30 > (this.originX - this.chain) - 150) && player.facing == 1)) //Movimiento cargado hacia la izquierda
    {
        player.body.velocity.x = -4 * player.velocity;
    }
    else //Quieto
    {
        player.body.velocity.x = 0;
        this.charged = false;
        this.charging = false;
    }
}
//Salto del chomp capturado
Chomp.prototype.MarioJump = function (player) { }
//Colisiones del chomp capturado con enemigos
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
//Colisiones del chomp capturado con bloques normales
Chomp.prototype.BlockCollision = function (tile, player) {
    if (this.charged) {
        player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
        this.breakSound.play();
    }
}
//Colisiones del chomp capturado con bloques normales
Chomp.prototype.EspecialBlockCollision = function (tile, prizeType) {
    if (tile.index == 2) {
        if (this.charged) {
            tile.index = 123;
            tile.layer.dirty = true;

            if (prizeType == 'coin') //Crea una moneda
            {
                this.coin = new Moneda(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.coinSprite);
                player.scene.objects.add(this.coin);
                this.coin.animations.play('coin');
            }
            else if (prizeType == 'heart') //Crea un corazón
                player.scene.objects.add(new Corazon(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.heartSprite, 0, 3));
            else //Crea un super corazón
                player.scene.objects.add(new Corazon(this.game, tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height), this.superHeartSprite, 0, 6));

            this.hitSound.play();
        }
    }
}
//Animaciones
Chomp.prototype.handleAnimations = function (player) {
    if (player.hurt) //Si se hace daño
    {
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
    else //Si se mueve
    {
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
