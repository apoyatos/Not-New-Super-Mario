'use strict';

var Cappy = require('./Cappy.js');
var Goomba = require('./Goomba.js');

function Mario(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Cappy
    this.cappy = null;
    this.cappyCooldownTimer = 0;
    this.thrown = false;
    //Vida y daño
    this.life = 3;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    //Movimiento
    this.velocity = 200;
    this.facing = 1; //1 derecha, -1 izquierda
    this.jumpVelocity = 350;
    this.tackles = 0;
    //Acciones
    this.moving = false;
    this.bombJump = false;
    this.tackling = false;
    this.swimming = false;
    this.crouching = false;
    //Posición
    this.spawnX = x;
    this.spawnY = y;
    //Captura
    this.capture = false;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 500;
    //Sprite y animaciones
    this.scale.setTo(2, 2);
    //Animaciones normales
    this.animations.add('runLeft', [4, 3, 2], 8, true);
    this.animations.add('runRight', [5, 6, 7], 8, true);
    this.animations.add('jumpLeft', [1], 10, false);
    this.animations.add('jumpRight', [8], 10, false);
    this.animations.add('idleLeft', [4], 10, false);
    this.animations.add('idleRight', [5], 10, false);
    this.animations.add('crouchLeft', [0], 10, false);
    this.animations.add('crouchRight', [9], 10, false);
    this.animations.add('tackleLeft', [13], 10, false);
    this.animations.add('tackleRight', [16], 10, false);
    this.animations.add('swimLeft', [14, 13, 12], 8, true);
    this.animations.add('swimRight', [15, 16, 17], 8, true);
    this.animations.add('bombLeft', [11], 10, false);
    this.animations.add('bombRight', [18], 10, false);
    //Animaciones sin Cappy
    this.animations.add('runLeftCappy', [24, 23, 22], 8, true);
    this.animations.add('runRightCappy', [25, 26, 27], 8, true);
    this.animations.add('jumpLeftCappy', [21], 10, false);
    this.animations.add('jumpRightCappy', [28], 10, false);
    this.animations.add('idleLeftCappy', [24], 10, false);
    this.animations.add('idleRightCappy', [25], 10, false);
    this.animations.add('crouchLeftCappy', [20], 10, false);
    this.animations.add('crouchRightCappy', [29], 10, false);
    this.animations.add('tackleLeftCappy', [33], 10, false);
    this.animations.add('tackleRightCappy', [36], 10, false);
    this.animations.add('swimLeftCappy', [34, 33, 32], 8, true);
    this.animations.add('swimRightCappy', [35, 36, 37], 8, true);
    this.animations.add('bombLeftCappy', [31], 10, false);
    this.animations.add('bombRightCappy', [38], 10, false);
    //Animaciones de daño
    this.animations.add('runLeftHurt', [4, 40, 3, 40, 2, 40], 8, true);
    this.animations.add('runRightHurt', [5, 40, 6, 40, 7, 40], 8, true);
    this.animations.add('jumpLeftHurt', [1, 40], 10, true);
    this.animations.add('jumpRightHurt', [8, 40], 10, true);
    this.animations.add('idleLeftHurt', [4, 40], 10, true);
    this.animations.add('idleRightHurt', [5, 40], 10, true);
    this.animations.add('crouchLeftHurt', [0, 40], 10, true);
    this.animations.add('crouchRightHurt', [9, 40], 10, true);
    this.animations.add('tackleLeftHurt', [13, 40], 10, true);
    this.animations.add('tackleRightHurt', [16, 40], 10, true);
    this.animations.add('swimLeftHurt', [14, 40, 13, 40, 12, 40], 8, true);
    this.animations.add('swimRightHurt', [15, 40, 16, 40, 17, 40], 8, true);
    this.animations.add('bombLeftHurt', [11, 40], 10, true);
    this.animations.add('bombRightHurt', [18, 40], 10, true);
    this.animations.add('runLeftCappyHurt', [24, 40, 23, 40, 22, 40], 8, true);
    this.animations.add('runRightCappyHurt', [25, 40, 26, 40, 27, 40], 8, true);
    this.animations.add('jumpLeftCappyHurt', [21, 40], 10, true);
    this.animations.add('jumpRightCappyHurt', [28, 40], 10, true);
    this.animations.add('idleLeftCappyHurt', [24, 40], 10, true);
    this.animations.add('idleRightCappyHurt', [25, 40], 10, true);
    this.animations.add('crouchLeftCappyHurt', [20, 40], 10, true);
    this.animations.add('crouchRightCappyHurt', [29, 40], 10, true);
    this.animations.add('tackleLeftCappyHurt', [33, 40], 10, true);
    this.animations.add('tackleRightCappyHurt', [36, 40], 10, true);
    this.animations.add('swimLeftCappyHurt', [34, 40, 33, 40, 32, 40], 8, true);
    this.animations.add('swimRightCappyHurt', [35, 40, 36, 40, 37, 40], 8, true);
    this.animations.add('bombLeftCappyHurt', [31, 40], 10, true);
    this.animations.add('bombRightCappyHurt', [38, 40], 10, true);
    //Animaciones de Goomba
    this.animations.add('walkGoomba', [44, 45], 5, true);
    this.animations.add('idleGoomba', [44], 5, false);
}
Mario.prototype = Object.create(Phaser.Sprite.prototype);
Mario.constructor = Mario;

//Comprueba si está en el suelo
Mario.prototype.CheckOnFloor = function () {
    if (this.body.onFloor()) {
        this.tackling = false;
        this.bombJump = false;
    }
}
//Movimiento
Mario.prototype.Move = function (dir) {
    this.facing = dir;
    if (!this.capture) //Si es Mario
    {
        if (!this.bombJump) //En el salto bomba no hay movimiento
        {
            this.moving = true;
            if (!this.crouching) //Si no esta agachado se mueve normal
                this.body.velocity.x = this.facing * this.velocity;
            else //Si está agachado la velocidd es un tercio de la original
                this.body.velocity.x = this.facing * (this.velocity / 3);
        }
    }
    else {
        this.moving = true;
        Goomba.prototype.MarioMove(this);
    }
}
//Ausencia de movimiento
Mario.prototype.NotMoving = function () {
    if (!this.capture) //Si es Mario
    {
        this.body.velocity.x = 0;
        this.moving = false;
    }
    else {
        this.moving = false;
        Goomba.prototype.MarioNotMoving(this);
    }
}
//Salto
Mario.prototype.Jump = function () {
    if (!this.capture) //Si es Mario
    {
        if (this.body.onFloor() && !this.crouching) //Si está en el suelo y no está agachado puede saltar
        {
            this.swimming = false;
            this.tackles = 1;
            this.body.velocity.y = -this.jumpVelocity;
        }
    }
    else if (this.body.onFloor()) {
        Goomba.prototype.MarioJump(this);
    }
}
//Impulso tras el salto
Mario.prototype.Tackle = function () {
    if (!this.capture) //Si es Mario
    {
        if (!this.body.onFloor() && this.tackles > 0) {
            this.body.velocity.y = -this.jumpVelocity / 2;
            this.body.velocity.x = this.facing * (this.velocity / 2);

            this.tackles--;
            this.tackling = true;
        }
    }
}
//Agacharse
Mario.prototype.Crouch = function () {
    if (!this.capture) //Si es Mario
    {
        if (!this.swimming) //Solo puede agacharse o hacer salto bomba si no esta nadando
        {
            if (this.body.onFloor()) {
                this.crouching = true;
            }
            else {
                this.body.velocity.y = 600;
                this.body.velocity.x = 0;
                this.tackles = 0;
                this.bombJump = true;
            }
        }
    }
}
//No agacharse
Mario.prototype.NotCrouching = function () {
    this.crouching = false;
}
//Nadar
Mario.prototype.Swim = function () {
    if (!this.capture) //Si es Mario
    {
        this.swimming = true;
        this.game.physics.arcade.gravity.y = 600;

        if (this.body.velocity.y >= 0)
            this.body.velocity.y = -200;
    }
    else {
        //
    }
}
//Colisión con enemigos
Mario.prototype.EnemyCollision = function (enemy) {
    if (this.game.physics.arcade.overlap(enemy, this) && !this.hurt)
        this.Hurt();
    if (this.game.time.totalElapsedSeconds() > this.hurtTimer)
        this.hurt = false;
}
//Daño
Mario.prototype.Hurt = function () {
    if (this.life > 1) {
        this.life--;
        this.hurt = true;
        this.hurtTimer = this.game.time.totalElapsedSeconds() + this.hurtTime;
    }
    else
        this.Die();
}
//Muerte
Mario.prototype.Die = function () {
    this.reset(this.spawnX, this.spawnY);
    this.life = 3;
}
//Lanzar a Cappy
Mario.prototype.ThrowCappy = function () {
    if (this.game.time.totalElapsedSeconds() > this.cappyCooldownTimer && !this.crouching && !this.tackling && !this.bombJump) {
        if (this.cappy == null) // Al principio crea una gorra
        {
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
        }
        else if (this.cappy != null && !this.cappy.alive && !this.capture) // Destruye la antigua y crea otra gorra
        {
            this.cappy.destroy();
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
        }
        else if (this.capture) // Reinicia el estado de la gorra
        {
            this.cappy.Reset()
            this.capture = false;
            this.cappy.cappyCapture = false;
        }
    }
}
//Animaciones
Mario.prototype.MarioAnims = function (dir, cappy, hurt) //String con la dirección, si tiene a cappy y si esta dañado
{
    if (this.swimming) //Animaciones cuando está nadando
        this.animations.play('swim' + dir + cappy + hurt);
    else if (this.body.onFloor()) //Animaciones cuando está en el suelo
    {
        this.bombJump = false;
        if (this.crouching)
            this.animations.play('crouch' + dir + cappy + hurt);
        else if (this.moving)
            this.animations.play('run' + dir + cappy + hurt);
        else
            this.animations.play('idle' + dir + cappy + hurt);
    }
    else //Animaciones cuando está en el aire
    {
        if (this.bombJump)
            this.animations.play('bomb' + dir + cappy + hurt);
        else if (this.tackling)
            this.animations.play('tackle' + dir + cappy + hurt);
        else
            this.animations.play('jump' + dir + cappy + hurt);
    }
}

Mario.prototype.EnemyAnims = function () //Animaciones cuando hay un enemigo capturado
{
    if (this.swimming) //Animaciones cuando está nadando
    {
        //
    }
    else if (this.hurt) {
        //
    }
    else if (this.body.onFloor()) //Animaciones cuando está en el suelo
    {
        if (this.crouching) {
            //
        }
        else if (this.moving) {
            //
        }
        else {
            //
        }
    }
    else //Animaciones cuando está en el aire
    {
        //
    }
}

Mario.prototype.handleAnimations = function () {
    if (!this.capture) //Si no hay enemigo capturado se ponen las animaciones de Mario
    {
        if (this.facing == 1) //Animaciones derecha
        {
            if (!this.hurt) {
                if (!this.thrown)
                    this.MarioAnims('Right', '', '');
                else
                    this.MarioAnims('Right', 'Cappy', '');
            }
            else {
                if (!this.thrown)
                    this.MarioAnims('Right', '', 'Hurt');
                else
                    this.MarioAnims('Right', 'Cappy', 'Hurt');
            }
        }
        else //Animaciones izquierda
        {
            if (!this.hurt) {
                if (!this.thrown)
                    this.MarioAnims('Left', '', '');
                else
                    this.MarioAnims('Left', 'Cappy', '');
            }
            else {
                if (!this.thrown)
                    this.MarioAnims('Left', '', 'Hurt');
                else
                    this.MarioAnims('Left', 'Cappy', 'Hurt');
            }
        }
    }
    else //Cuando hay enemigo capturado
    {
        if (this.facing == 1) //Animaciones derecha
        {
            //
        }
        else //Animaciones izquierda
        {
            //
        }
    }
}

module.exports = Mario;
