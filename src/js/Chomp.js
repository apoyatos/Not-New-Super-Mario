'use strict';

var Enemy = require('./Enemigo.js');

function Chomp(game, x, y, sprite, frame, speed, chain, distance, cooldown, player, offset) {
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
    this.offset = offset;
    //Acciones
    this.attack = false;
    this.charging = false;
    this.chargeAttack = false;
    this.captured = false;
    //Temporizadores
    this.cooldownTime = cooldown;
    this.cooldownTimer = 0;
    this.chargeTime = 0.25;
    this.chargeTimer = 0;
    //Sonidos
    this.breakSound = this.game.add.audio('break');
    this.hitSound = this.game.add.audio('hit');
    this.attackSound = this.game.add.audio('chomp');
    this.attackSound.volume = 0.5;
    //Animaciones
    this.animations.add('walkLeft', [2, 1, 3], 5, true);
    this.animations.add('walkRight', [5, 6, 4], 5, true);
    this.animations.add('chargeLeft', [0], 5, false);
    this.animations.add('chargeRight', [7], 5, false);
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
        //Cuando está atacando lanzado por Mario
        if (this.charged) {
            //Si llega al límite derecho cuando está atacando
            if ((this.x + (this.speed * this.dir) / 20 > (this.originX + this.chain + this.offset))) {
                this.charged = false;
                this.x = this.originX + this.chain - this.speed / 20;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + 2 * this.cooldownTime;
            }
            //Si llega al límite izquierdo cuando está atacando
            else if ((this.x - (this.speed * this.dir) / 20 < (this.originX - this.chain - this.offset))) {
                this.charged = false;
                this.x = this.originX - this.chain + this.speed / 20;
                this.cooldownTimer = this.game.time.totalElapsedSeconds() + 2 * this.cooldownTime;
            }
            this.body.velocity.x = this.speed * this.dir;
        }
        //Si no está atacando
        else {
            if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
                //Si ha llegado a un límite
                if ((this.x + (this.speed * this.dir) / 20 > (this.originX + this.chain)) || (this.x + (this.speed * this.dir) / 20 < (this.originX - this.chain))) {
                    //Si ha llegado al límite atacando se lanza más rápido hacia Mario
                    if (this.chargeAttack) {
                        this.speed = 8 * this.originalSpeed;
                        this.chargeAttack = false;
                        this.attack = true;
                        this.attackSound.play();
                    }
                    //Si ha llegado al límite después de atacar espera y regresa a la velocidad original
                    else if (this.attack) {
                        this.cooldownTimer = this.game.time.totalElapsedSeconds() + this.cooldownTime;
                        this.speed = this.originalSpeed;
                        this.attack = false;
                    }
                    this.dir = -this.dir;
                }
                this.body.velocity.x = this.speed * this.dir;
            }
            //Si está en espera no se mueve
            else
                this.body.velocity.x = 0;
        }
        this.ChompAnim();
    }
}
//Cambia la dirección del chomp
Chomp.prototype.ChangeDir = function () {
    this.dir = -this.dir
}
//Ataque del chomp
Chomp.prototype.Attack = function (player) {
    if (this.game.time.totalElapsedSeconds() > this.cooldownTimer) {
        //Si no está cargando o atacando y Mario se encuentra a en su rango comienza a cargar el ataque
        if (!this.chargeAttack && !this.attack && !this.charged && this.dir == Math.sign(player.x - this.x) 
        && (player.y < this.bottom) && (player.y > this.y - 2 * this.height) && Math.abs(player.x - this.x) < this.distance) {
            this.speed = 4 * this.originalSpeed;
            this.dir = -this.dir
            this.chargeAttack = true;
        }
    }
}
//Animaciones del chomp
Chomp.prototype.ChompAnim = function () {
    if (this.dir < 0) //Izquierda
    {
        if (!this.chargeAttack) //Si no está cargando el ataque
            this.animations.play('walkLeft');
        else //Si está cargando el ataque
            this.animations.play('chargeRight');
    }
    else if (this.dir > 0) //Derecha
    {
        if (!this.chargeAttack) //Si no está cargando el ataque
            this.animations.play('walkRight');
        else //Si está cargando el ataque
            this.animations.play('chargeLeft');
    }
}
//Captura del chomp
Chomp.prototype.Capture = function (cappy) {
    if (cappy != null)
        cappy.Capture(this);
}
//Movimiento de Mario chomp
Chomp.prototype.MarioMove = function (player) {
    //Si no llega al límite derecho se mueve a velocidad normal
    if ((player.x + player.velocity / 30 < (this.originX + this.chain)) && player.facing == 1) //Derecha
    {
        player.body.velocity.x = player.velocity / 2;
        this.charged = false;
        this.charging = false;
    }
    //Si no llega al límite izquierdo se mueve a velocidad normal
    else if ((player.x - player.velocity / 30 > (this.originX - this.chain)) && player.facing == -1) //Izquierda
    {
        player.body.velocity.x = -player.velocity / 2;
        this.charged = false;
        this.charging = false;
    }
    else {
        //cuando llega a uno de los límites comienza a cargar el ataque
        player.body.velocity.x = 0;
        //Si no está cargado o lanzandose empieza a cargar el ataque
        if (!this.charging && !this.charged) {
            this.chargeTimer = this.game.time.totalElapsedSeconds() + this.chargeTime;
            this.charging = true;
            this.charged = false;
        }
        else if (this.game.time.totalElapsedSeconds() > this.chargeTimer)
            this.charged = true;
    }
}
//Mario chomp lanzando al chomp o quieto
Chomp.prototype.MarioNotMoving = function (player) {
    if (this.captured) {
        //Si está cargado lanza al chomp y sale de él
        if (this.charged) {
            this.dir = -player.facing
            this.chargeAttack = false
            player.ThrowCappy();
            this.speed = 8 * this.originalSpeed;
            this.attackSound.play();
        }
        else //Quieto
        {
            player.body.velocity.x = 0;
            this.charged = false;
            this.charging = false;
        }
    }
}
//Salto de Mario chomp
Chomp.prototype.MarioJump = function (player) { }
//Colisión de Mario chomp con enemigos
Chomp.prototype.MarioCollision = function (player) {
    Enemy.prototype.Collision(player);
}
//Colisión de Mario chomp con bloques normales
Chomp.prototype.BlockCollision = function (player, tile) {
    if (this.charged) {
        player.scene.map.removeTile(tile.x, tile.y, player.scene.blocks);
        this.breakSound.play();
    }
}
//Colisión de Mario chomp con bloques especiales
Chomp.prototype.EspecialBlockCollision = function (tile, spawner) {
    if (tile.index == 498) //Bloque sin activar
    {
        if (this.charged) {
            //Al chocar con el bloque crea el premio
            tile.index = 619;
            tile.layer.dirty = true;
            player.scene.objects.add(spawner.Spawn(tile.worldX, tile.worldY + (Math.sign(tile.worldY - player.y) * tile.height)));
            this.hitSound.play();
        }
    }
}
//Animaciones de Mario chomp
Chomp.prototype.handleAnimations = function (player) {
    if (player.hurt) //Si se hace daño
    {
        if (this.charging) //Si está cargando
        {
            if (player.facing == -1)
                player.animations.play('hurtChargeChompLeft');
            else
                player.animations.play('hurtChargeChompRight');
        }
        else if (!this.charged) //Si no está atacando
        {
            if (player.facing == -1)
                player.animations.play('hurtChompLeft');
            else
                player.animations.play('hurtChompRight');
        }
        else if (this.charged) //Si está atacando
        {
            if (player.facing == 1)
                player.animations.play('hurtChompLeft');
            else
                player.animations.play('hurtChompRight');
        }
    }
    else {
        if (this.charging) //Si está cargando
        {
            if (player.facing == -1)
                player.animations.play('chargeChompLeft');
            else
                player.animations.play('chargeChompRight');
        }
        else if (!this.charged) //Si no está atacando
        {
            if (player.facing == -1)
                player.animations.play('walkChompLeft');
            else
                player.animations.play('walkChompRight');
        }
        else if (this.charged) //Si está atacando
        {
            if (player.facing == 1)
                player.animations.play('walkChompLeft');
            else
                player.animations.play('walkChompRight');
        }
    }
}

module.exports = Chomp;
