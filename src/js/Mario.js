'use strict';

var Cappy = require('./Cappy.js');
var Goomba = require('./Goomba.js');

function Mario(game, x, y, sprite, frame) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Cappy
    this.cappy = null;
    this.cappyCooldownTimer = 0;
    this.thrown = false;
    this.cappyPlant = false;
    //Vida y daño
    this.life = 6;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    //Movimiento
    this.velocity = 200;
    this.facing = 1; //derecha = 1, izquierda = -1
    this.jumpVelocity = 415;
    this.tackles = 0;
    //Acciones
    this.moving = false;
    this.bombJump = false;
    this.tackling = false;
    this.swimming = false;
    this.crouching = false;
    this.running = false;
    this.kicking = false;
    //Timers
    this.timeKicking = 0.2;
    this.tK = 0;
    this.timeThrowing = 0.2;
    this.tT = 0;
    //Posición
    this.spawnX = x;
    this.spawnY = y - 300;
    //Captura
    this.capture = false;
    this.enemy;
    this.goombaCount = 1;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.gravity.y = 500;
    this.body.collideWorldBounds = true;
    //Sprite y animaciones
    this.scale.setTo(2.5, 2.5);
    this.originalHeight = this.body.height * this.scale.x;
    //Animaciones normales
    this.animations.add('runLeft', Phaser.Animation.generateFrameNames('walkLeft', 1, 3), 8, true);
    this.animations.add('runRight', Phaser.Animation.generateFrameNames('walkRight', 1, 3), 8, true);
    this.animations.add('jumpLeft', ['jumpLeft'], 10, false);
    this.animations.add('jumpRight', ['jumpRight'], 10, false);
    this.animations.add('idleLeft', ['walkLeft1'], 10, false);
    this.animations.add('idleRight', ['walkRight1'], 10, false);
    this.animations.add('crouchLeft', Phaser.Animation.generateFrameNames('crouchLeft', 1, 2), 10, false);
    this.animations.add('crouchRight', Phaser.Animation.generateFrameNames('crouchRight', 1, 2), 10, false);
    this.animations.add('idleCrouchLeft', ['crouchLeft1'], 10, false);
    this.animations.add('idleCrouchRight', ['crouchRight1'], 10, false);
    this.animations.add('tackleLeft', ['swimLeft2'], 10, false);
    this.animations.add('tackleRight', ['swimRight2'], 10, false);
    this.animations.add('swimLeft', Phaser.Animation.generateFrameNames('swimLeft', 1, 3), 8, true);
    this.animations.add('swimRight', Phaser.Animation.generateFrameNames('swimRight', 1, 3), 8, true);
    this.animations.add('bombLeft', ['bombLeft'], 10, false);
    this.animations.add('bombRight', ['bombRight'], 10, false);
    this.animations.add('crouchingLeft', Phaser.Animation.generateFrameNames('crouchingLeft', 1, 4), 10, false);
    this.animations.add('crouchingRight', Phaser.Animation.generateFrameNames('crouchingRight', 1, 4), 10, false);
    this.animations.add('throwLeft', ['throwLeft'], 10, false);
    this.animations.add('throwRight', ['throwRight'], 10, false);
    //Animaciones sin Cappy
    this.animations.add('runLeftCappy', Phaser.Animation.generateFrameNames('walkLeftCappy', 1, 3), 8, true);
    this.animations.add('runRightCappy', Phaser.Animation.generateFrameNames('walkRightCappy', 1, 3), 8, true);
    this.animations.add('jumpLeftCappy', ['jumpLeftCappy'], 10, false);
    this.animations.add('jumpRightCappy', ['jumpRightCappy'], 10, false);
    this.animations.add('idleLeftCappy', ['walkLeftCappy1'], 10, false);
    this.animations.add('idleRightCappy', ['walkRightCappy1'], 10, false);
    this.animations.add('crouchLeftCappy', Phaser.Animation.generateFrameNames('crouchLeftCappy', 1, 2), 10, false);
    this.animations.add('crouchRightCappy', Phaser.Animation.generateFrameNames('crouchRightCappy', 1, 2), 10, false);
    this.animations.add('idleCrouchLeftCappy', ['crouchLeftCappy1'], 10, false);
    this.animations.add('idleCrouchRightCappy', ['crouchRightCappy1'], 10, false);
    this.animations.add('tackleLeftCappy', ['swimLeftCappy2'], 10, false);
    this.animations.add('tackleRightCappy', ['swimRightCappy2'], 10, false);
    this.animations.add('swimLeftCappy', Phaser.Animation.generateFrameNames('swimLeftCappy', 1, 3), 8, true);
    this.animations.add('swimRightCappy', Phaser.Animation.generateFrameNames('swimRightCappy', 1, 3), 8, true);
    this.animations.add('bombLeftCappy', ['bombLeftCappy'], 10, false);
    this.animations.add('bombRightCappy', ['bombRightCappy'], 10, false);
    this.animations.add('crouchingLeftCappy', Phaser.Animation.generateFrameNames('crouchingLeftCappy', 1, 4), 10, false);
    this.animations.add('crouchingRightCappy', Phaser.Animation.generateFrameNames('crouchingRightCappy', 1, 4), 10, false);
    this.animations.add('kickLeft', ['kickLeft'], 10, false);
    this.animations.add('kickRight', ['kickRight'], 10, false);
    //Animaciones de daño
    this.animations.add('runLeftHurt', ['walkLeft1', 'hurt', 'walkLeft2', 'hurt', 'walkLeft3'], 10, true);
    this.animations.add('runRightHurt', ['walkRight1', 'hurt', 'walkRight2', 'hurt', 'walkRight3'], 10, true);
    this.animations.add('jumpLeftHurt', ['jumpLeft', 'hurt'], 10, true);
    this.animations.add('jumpRightHurt', ['jumpRight', 'hurt'], 10, true);
    this.animations.add('idleLeftHurt', ['walkLeft1', 'hurt'], 10, true);
    this.animations.add('idleRightHurt', ['walkRight1', 'hurt'], 10, true);
    this.animations.add('crouchLeftHurt', ['crouchLeft1', 'hurt', 'crouchLeft2', 'hurt'], 10, true);
    this.animations.add('crouchRightHurt', ['crouchRight1', 'hurt', 'crouchRight2', 'hurt'], 10, true);
    this.animations.add('idleCrouchLeftHurt', ['crouchLeft1', 'hurt'], 10, false);
    this.animations.add('idleCrouchRightHurt', ['crouchRight1', 'hurt'], 10, false);
    this.animations.add('tackleLeftHurt', ['swimLeft2', 'hurt'], 10, true);
    this.animations.add('tackleRightHurt', ['swimRight2', 'hurt'], 10, true);
    this.animations.add('swimLeftHurt', ['swimLeft1', 'hurt', 'swimLeft2', 'hurt', 'swimLeft3'], 10, true);
    this.animations.add('swimRightHurt', ['swimRight1', 'hurt', 'swimRight2', 'hurt', 'swimRight3'], 10, true);
    this.animations.add('bombLeftHurt', ['bombLeft', 'hurt'], 10, true);
    this.animations.add('bombRightHurt', ['bombRight', 'hurt'], 10, true);
    this.animations.add('crouchingLeftHurt', ['crouchingLeft1', 'hurt', 'crouchingLeft2', 'hurt', 'crouchingLeft3', 'hurt', 'crouchingLeft4', 'hurt'], 10, false);
    this.animations.add('crouchingRightHurt', ['crouchingRight1', 'hurt', 'crouchingRight2', 'hurt', 'crouchingRight3', 'hurt', 'crouchingRight4', 'hurt'], 10, false);
    this.animations.add('runLeftCappyHurt', ['walkLeftCappy1', 'hurt', 'walkLeftCappy2', 'hurt', 'walkLeftCappy3'], 10, true);
    this.animations.add('runRightCappyHurt', ['walkRightCappy1', 'hurt', 'ealkRightCappy2', 'hurt', 'walkRightCappy3'], 10, true);
    this.animations.add('jumpLeftCappyHurt', ['jumpLeftCappy', 'hurt'], 10, true);
    this.animations.add('jumpRightCappyHurt', ['jumpRightCappy', 'hurt'], 10, true);
    this.animations.add('idleLeftCappyHurt', ['walkLeftCappy1', 'hurt'], 10, true);
    this.animations.add('idleRightCappyHurt', ['walkRightCappy1', 'hurt'], 10, true);
    this.animations.add('crouchLeftCappyHurt', ['crouchLeftCappy', 'hurt'], 10, true);
    this.animations.add('crouchRightCappyHurt', ['crouchRightCappy', 'hurt'], 10, true);
    this.animations.add('tackleLeftCappyHurt', ['swimLeftCappy2', 'hurt'], 10, true);
    this.animations.add('tackleRightCappyHurt', ['swimRightCappy2', 'hurt'], 10, true);
    this.animations.add('swimLeftCappyHurt', ['swimLeftCappy1', 'hurt', 'swimLeftCappy2', 'hurt', 'swimLeftCappy3'], 10, true);
    this.animations.add('swimRightCappyHurt', ['swimRightCappy1', 'hurt', 'swimRightCappy2', 'hurt', 'swimRightCappy3'], 10, true);
    this.animations.add('bombLeftCappyHurt', ['bombLeftCappy', 'hurt'], 10, true);
    this.animations.add('bombRightCappyHurt', ['bombRightCappy', 'hurt'], 10, true);
    //Animaciones de Goomba
    this.animations.add('walkGoomba1', ['goombaLeft1', 'goombaRight1'], 5, true);
    this.animations.add('idleGoomba1', ['goombaLeft1'], 5, false);
    this.animations.add('hurtGoomba1', ['goombaLeft1', 'hurt'], 10, true);
    this.animations.add('walkGoomba2', ['goombaLeft2', 'goombaRight2'], 5, true);
    this.animations.add('idleGoomba2', ['goombaLeft2'], 5, false);
    this.animations.add('hurtGoomba2', ['goombaLeft2', 'hurt'], 10, true);
    this.animations.add('walkGoomba3', ['goombaLeft3', 'goombaRight3'], 5, true);
    this.animations.add('idleGoomba3', ['goombaLeft3'], 5, false);
    this.animations.add('hurtGoomba3', ['goombaLeft3', 'hurt'], 10, true);
    this.animations.add('walkGoomba4', ['goombaLeft4', 'goombaRight4'], 5, true);
    this.animations.add('idleGoomba4', ['goombaLeft4'], 5, false);
    this.animations.add('hurtGoomba4', ['goombaLeft4', 'hurt'], 10, true);
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
            if (!this.crouching && !this.running) //Si no está agachado y no está corriendo
                this.body.velocity.x = this.facing * this.velocity;
            else if (this.crouching && !this.running) //Si está agachado
                this.body.velocity.x = this.facing * (this.velocity / 3);
            else if (!this.crouching && this.running) //Si está corriendo
                this.body.velocity.x = this.facing * this.velocity * 1.75;
            else if (this.crouching && this.running) //Si está agachado corriendo
                this.body.velocity.x = this.facing * this.velocity * 1.5;
        }
    }
    else if (this.enemy = 'goomba') {
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
    else if (this.enemy = 'goomba') {
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
    else if ((this.enemy = 'goomba') && this.body.onFloor()) {
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
Mario.prototype.EnemyCollision = function (player, enemy) {
    if (!this.capture) {
        if (this.game.physics.arcade.overlap(enemy, this) && !this.hurt) {
            if (enemy.type == 'planta' && this.cappyPlant) {
                this.tK = this.game.time.totalElapsedSeconds() + this.timeKicking;
                this.kicking = true;
                enemy.kill();
                this.cappyPlant = false;
                this.cappy.Reset();
            }
            else {
                this.Hurt();
                return true;
            }
        }
        if (this.game.time.totalElapsedSeconds() > this.hurtTimer) {
            this.hurt = false;
            return false;
        }
    }
    else if (this.enemy == 'goomba') {
        Goomba.prototype.GoombaCollision(player, enemy);
    }
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
    console.log(this.life);
}
//Muerte
Mario.prototype.Die = function () {
    this.reset(this.spawnX, this.spawnY);
    this.life = 3;
    this.goombaCount=0;
    this.capture = false;
    if (this.cappy != null)
        this.cappy.Reset();
    this.recalculateBody();
}
//Lanzar a Cappy
Mario.prototype.ThrowCappy = function () {
    if (this.game.time.totalElapsedSeconds() > this.cappyCooldownTimer && !this.crouching && !this.tackling && !this.bombJump) {
        if (this.cappy == null) // Al principio crea una gorra
        {
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
            this.tT = this.game.time.totalElapsedSeconds() + this.timeThrowing;
        }
        else if (this.cappy != null && !this.cappy.alive && !this.capture && !this.cappyPlant) // Destruye la antigua y crea otra gorra
        {
            this.cappy.destroy();
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
            this.tT = this.game.time.totalElapsedSeconds() + this.timeThrowing;
        }
        else if (this.capture) // Reinicia el estado de la gorra
        {
            this.cappy.Reset()
            this.capture = false;
            this.cappy.cappyCapture = false;
            this.recalculateBody();
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
        if (this.tT > this.game.time.totalElapsedSeconds()) {
            if (this.thrown)
                this.animations.play('throw' + dir);
        }
        else if (this.kicking) {
            if (this.tK > this.game.time.totalElapsedSeconds())
                this.animations.play('kick' + dir);
            else
                this.kicking = false;
        }
        else if (!this.moving && this.crouching)
            this.animations.play('idleCrouch' + dir + cappy + hurt);
        else if (this.crouching && this.running)
            this.animations.play('crouching' + dir + cappy + hurt);
        else if (this.crouching)
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
        else if (this.tT > this.game.time.totalElapsedSeconds()) {
            if (this.thrown)
                this.animations.play('throw' + dir);
        }
        else if (this.kicking) {
            if (this.tK > this.game.time.totalElapsedSeconds())
                this.animations.play('kick' + dir);
            else
                this.kicking = false;
        }
        else
            this.animations.play('jump' + dir + cappy + hurt);
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
    else if (this.enemy == 'goomba') {
        Goomba.prototype.handleAnimations(this);
    }

}
Mario.prototype.recalculateBody = function () {
    this.handleAnimations();
    this.body.height = this.height;
    this.body.width = this.width;
}

module.exports = Mario;
