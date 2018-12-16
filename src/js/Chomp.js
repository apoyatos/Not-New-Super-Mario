'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance, cooldown, player) {
    Enemy.call(this, game, x, y, sprite, frame, 0, 0);
    //Mario
    this.player = player;
    this.charged = false;
    //Movimiento
    this.speed = speed;
    this.dir = 1;
    this.chain = chain;
    this.distance = distance;
    this.originalSpeed = speed;
    this.originX = x;
    this.offset = 150;
    //Acciones
    this.attack = false;
    this.charging = false;
    this.chargeAttack = false;
    this.captured = false;
    //Temporizadores
    this.cooldownTime = cooldown;
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
    if (!this.captured) //Si es el chomp
    {
        if (this.charged) //Cargando
        {
            if ((this.x + (this.speed * this.dir) / 20 > (this.originX + this.chain + this.offset))) //Derecha
            {
                this.charged = false;
                this.x = this.originX + this.chain - this.speed / 20;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + 2 * this.cooldownTime;
            }
            else if ((this.x - (this.speed * this.dir) / 20 < (this.originX - this.chain - this.offset))) //Izquierda
            {
                this.charged = false;
                this.x = this.originX - this.chain + this.speed / 20;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + 2 * this.cooldownTime;
            }
            this.body.velocity.x = this.speed * this.dir;
        }
        else //cargado
        {
            if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
                if ((this.x + (this.speed * this.dir) / 20 > (this.originX + this.chain)) || (this.x + (this.speed * this.dir) / 20 < (this.originX - this.chain))) {
                    if (this.chargeAttack) //Ataque cargado
                    {
                        this.speed = 8 * this.originalSpeed;
                        this.chargeAttack = false;
                        this.attack = true;
                    }
                    else if (this.attack) //Ataque normal
                    {
                        this.cooldownTimer = this.game.time.totalElapsedSeconds() + this.cooldownTime;
                        this.speed = this.originalSpeed;
                        this.attack = false;
                    }
                    this.dir = -this.dir;
                }
                this.body.velocity.x = this.speed * this.dir;
            }
            else //Quieto
                this.body.velocity.x = 0;
        }
        //Animaciones
        if ((this.dir < 0 && !this.chargeAttack) || (this.dir > 0 && this.chargeAttack))
            this.animations.play('walkLeft');
        else if ((this.dir > 0 && !this.chargeAttack) || (this.dir < 0 && this.chargeAttack))
            this.animations.play('walkRight');
    }
}
//Ataque del chomp
Chomp.prototype.Attack = function (player) {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        //Si no esta cargando o atacando y se encuentra a cierta distancia de Mario
        if (!this.chargeAttack && !this.attack && !this.charged && this.dir == Math.sign(player.x - this.x) && Math.abs(player.x - this.x) < this.distance) {
            this.speed = 4 * this.originalSpeed;
            this.dir = -this.dir
            this.chargeAttack = true;
        }
    }
}
//Movimiento del chomp capturado
Chomp.prototype.MarioMove = function (player) {
    if ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == 1) //Derecha
    {
        player.body.velocity.x = player.velocity / 2;
        this.charged = false;
        this.charging = false;
    }
    else if ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == -1) //Izquierda
    {
        player.body.velocity.x = -player.velocity / 2;
        this.charged = false;
        this.charging = false;
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
//Chomp capturado cargando o quieto
Chomp.prototype.MarioNotMoving = function (player) {
    if (this.captured) {
        if (this.charged) //Cargando
        {
            this.dir = -player.facing
            this.chargeAttack = false
            player.ThrowCappy();
            this.speed = 8 * this.originalSpeed;
        }
        else //Quieto
        {
            player.body.velocity.x = 0;
            this.charged = false;
            this.charging = false;
        }
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
//Colisiones del chomp capturado con bloques especiales
Chomp.prototype.EspecialBlockCollision = function (tile, prizeType) {
    if (tile.index == 2) //Bloque sin activar
    {
        if (this.charged) //Si está cargado
        {
            //Al chocar con el bloque crea el premio
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
