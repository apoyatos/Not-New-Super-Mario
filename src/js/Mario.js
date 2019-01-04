'use strict';

var Cappy = require('./Cappy.js');

function Mario(game, x, y, sprite, frame, scene) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Cappy
    this.cappy = new Cappy(this.game, this.x, this.y, 'cappy', this, 1);
    this.cappy.kill();
    this.thrown = false;
    this.cappyPlant = false;
    this.cappyCooldownTimer = 0;
    //Vida y daño
    this.life = 6;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    //Objetos
    this.coins = 0;
    this.superCoins = 0;
    this.moons = 0;
    //Movimiento
    this.velocity = 200;
    this.prevY = this.y;
    this.facing = 1;
    this.jumpVelocity = 370;
    this.tackles = 0;
    //Acciones
    this.moving = false;
    this.bombJump = false;
    this.tackling = false;
    this.swimming = false;
    this.crouching = false;
    this.running = false;
    this.kicking = false;
    //Temporizadores
    this.kickTime = 0.2;
    this.kickTimer = 0;
    this.throwTime = 0.2;
    this.throwTimer = 0;
    //Posición de reaparición
    this.spawnX = x;
    this.spawnY = y - 300;
    //Captura
    this.capture = false;
    this.enemy;
    this.goombaCount = 1;
    //Propiedades
    this.scene = scene;
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 600;
    this.scale.setTo(2, 2);
    //Sonidos
    this.jumpSound = this.game.add.audio('jump');
    this.tackleSound = this.game.add.audio('swim');
    this.bombSound = this.game.add.audio('hit');
    this.kickSound = this.game.add.audio('kick');
    this.hurtSound = this.game.add.audio('hurt');
    //Caja de colión
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
    this.animations.add('throwLeft', ['throwLeft'], 10, false);
    this.animations.add('throwRight', ['throwRight'], 10, false);
    this.animations.add('kickLeft', ['kickLeft'], 10, false);
    this.animations.add('kickRight', ['kickRight'], 10, false);
    //Animaciones herido
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
    //Animaciones del Goomba
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
    //Animaciones del Chomp
    this.animations.add('walkChompLeft', Phaser.Animation.generateFrameNames('ChompLeft', 1, 3), 5, true);
    this.animations.add('walkChompRight', Phaser.Animation.generateFrameNames('ChompRight', 1, 3), 5, true);
    this.animations.add('hurtChompLeft', ['ChompLeft1', 'hurt', 'ChompLeft2', 'hurt', 'ChompLeft3', 'hurt'], 5, true);
    this.animations.add('hurtChompRight', ['ChompRight1', 'hurt', 'ChompRight2', 'hurt', 'ChompRight3', 'hurt'], 5, true);
    this.animations.add('chargeChompRight', ['ChompChargeRight'], 5, false);
    this.animations.add('chargeChompLeft', ['ChompChargeLeft'], 5, false);
    this.animations.add('hurtChargeChompRight', ['ChompChargeRight', 'hurt'], 5, true);
    this.animations.add('hurtChargeChompLeft', ['ChompChargeLeft', 'hurt'], 5, true);
    //Animaciones del T-Rex
    this.animations.add('walkDinoLeft', Phaser.Animation.generateFrameNames('DinoLeft', 1, 10), 5, true);
    this.animations.add('walkDinoRight', Phaser.Animation.generateFrameNames('DinoRight', 1, 10), 5, true);
    this.animations.add('idleDinoLeft', ['DinoLeft9'], 5, false);
    this.animations.add('idleDinoRight', ['DinoRight9'], 5, false);
}
Mario.prototype = Object.create(Phaser.Sprite.prototype);
Mario.constructor = Mario;

//Comprueba si Mario está en el suelo
Mario.prototype.CheckOnFloor = function () {
    if (this.body.onFloor()) {
        this.prevY = this.y
        this.tackling = false;
        this.bombJump = false;
    }
}
//Movimiento de Mario
Mario.prototype.Move = function (dir) {
    this.facing = dir;
    this.prevY = this.y;
    if (!this.capture) //Si es Mario
    {
        if (!this.bombJump) //En el salto bomba no hay movimiento
        {
            this.moving = true;
            if (!this.crouching) //Si no está agachado
                this.body.velocity.x = this.facing * this.velocity;
            else if (this.crouching && !this.running) //Si está agachado
                this.body.velocity.x = this.facing * (this.velocity / 3);
            else if (this.crouching && this.running) //Si está agachado corriendo
                this.body.velocity.x = this.facing * this.velocity * 1.7;
        }
    }
    else //Enemigos capturados
    {
        this.moving = true;
        this.enemy.MarioMove(this);
    }
}
//Mario quieto
Mario.prototype.NotMoving = function () {
    if (!this.capture) //Si es Mario
    {
        this.body.velocity.x = 0;
        this.moving = false;
    }
    else //Enemigos capturados
    {
        this.moving = false;
        this.enemy.MarioNotMoving(this);
    }
}
//Salto de Mario
Mario.prototype.Jump = function () {
    this.prevY = this.y;
    if (!this.capture && this.body.onFloor() && !this.crouching) //Si es Mario. Si está en el suelo y no está agachado puede saltar
    {
        this.swimming = false;
        this.tackles = 1;
        this.body.velocity.y = -this.jumpVelocity;
        this.jumpSound.play();
    }
    else if ((this.capture && this.body.onFloor())) //Enemigos capturados
    {
        this.enemy.MarioJump(this);
    }
}
//Impulso de Mario tras el salto
Mario.prototype.Tackle = function () {
    this.prevY = this.y;
    if (!this.capture && !this.body.onFloor() && this.tackles > 0) //Si es Mario. Si está en el aire se puede impulsar
    {
        if (!this.body.onFloor() && this.tackles > 0) {
            this.body.velocity.y = -this.jumpVelocity / 1.8;
            this.body.velocity.x = this.facing * (this.velocity / 2);

            this.tackles--;
            this.tackling = true;
            this.tackleSound.play();
        }
    }
}
//Salto bomba de Mario
Mario.prototype.JumpBomb = function () {
    if (!this.capture && !this.body.onFloor() && !this.swimming) //Si es Mario. Solo puede hacer el salto bomba si no esta nadando y está en el aire
    {
        this.prevY = this.y;
        this.body.velocity.y = 600;
        this.body.velocity.x = 0;
        this.tackles = 0;
        this.bombJump = true;
        //this.bombSound.play();
    }
}
//Mario agachado
Mario.prototype.Crouch = function () {
    if (!this.capture && this.body.onFloor() && !this.swimming) //Si es Mario. Solo puede agacharse si no esta nadando y está en el suelo
        this.crouching = true;
}
//Mario de pie
Mario.prototype.NotCrouching = function () {
    this.crouching = false;
}
//Mario nadando
Mario.prototype.Swim = function () {
    if (!this.capture) //Si es Mario
    {
        this.prevY = this.y;
        this.swimming = true;
        this.game.physics.arcade.gravity.y = 600;

        if (this.body.velocity.y >= 0)
            this.body.velocity.y = -200;
    }
    else //Enemigos capturados
    {
        //Movimiento del pez (DLC)
    }
}
//Colisión de Mario con objetos
Mario.prototype.ObjectCollision = function (object) {
    if (this.game.physics.arcade.overlap(object, this)) {
        object.Collision(this, this.scene);
    }
}
Mario.prototype.Kick=function(){
    this.kickTimer = this.game.time.totalElapsedSeconds() + this.kickTime;
    this.kicking = true;
    //Mata a la planta y reproduce el sonido
    this.kickSound.play();
    //Reinica a Cappy
    this.cappyPlant = false;
    this.cappy.Reset();
}
//Colisión de Mario con enemigos
Mario.prototype.EnemyCollision = function (enemy) {

    if (this.game.physics.arcade.overlap(enemy, this) && !this.hurt) {
        if (!this.capture) //Si es Mario
        {
            enemy.Collision(this)
        }
        else //Enemigos capturados
            this.enemy.MarioCollision(this, enemy);
    }
    if (this.game.time.totalElapsedSeconds() > this.hurtTimer) {
        this.hurt = false;
    }

}
//Daño de Mario
Mario.prototype.Hurt = function () {
    if (this.life > 1) //Su vida es 1 o más
    {
        //Reduce la vida en uno y reproduce el sonido
        this.life--;
        this.hurtSound.play();
        this.hurt = true;
        this.hurtTimer = this.game.time.totalElapsedSeconds() + this.hurtTime;
    }
    else //Su vida es 0
        this.Die();
}
//Muerte de Mario
Mario.prototype.Die = function () {
    //Reinicia su posición, su vida, etc
    this.reset(this.spawnX, this.spawnY);
    this.life = 3;
    this.goombaCount = 1;
    this.capture = false;
    if (this.enemy != null)
        this.recalculateBody();
    //Reinicia a Cappy
    if (this.cappy != null)
        this.cappy.Reset();
    //Revive a todos los enemigos
    this.scene.enemies.forEach(
        function (item) {
            if (!item.alive) {
                item.revive();
            }
        }, this);
}
//Lanzamiento de Cappy
Mario.prototype.ThrowCappy = function () {
    if (this.game.time.totalElapsedSeconds() > this.cappyCooldownTimer && !this.crouching && !this.tackling && !this.bombJump) {
        if (!this.cappy.alive && !this.capture && !this.cappyPlant) //Destruye a Cappy y crea otro
        {
            this.cappy.destroy();
            this.cappy = new Cappy(this.game, this.body.x, this.body.y, 'cappy', this, this.facing);
            this.cappy.Throw();
            this.throwTimer = this.game.time.totalElapsedSeconds() + this.throwTime;
        }
        else if (this.capture) //Sale del estado de captura
        {
            //Impulsa a Mario
            this.body.velocity.y = -this.jumpVelocity / 1.2;
            this.tackling = false;
            this.tackles = 1;
            //Reinicia a Cappy, etc
            this.cappy.Reset()
            this.capture = false;
            this.cappy.cappyCapture = false;
            this.scale.setTo(2, 2);
            this.recalculateBody();
            this.enemy.captured = false
            //El enemigo reaparece
            this.enemy.Reset(this.x + this.enemy.width * -this.facing, this.y, this.goombaCount);
        }
    }
}
//Animaciones
Mario.prototype.MarioAnims = function (dir, cappy, hurt) //String con la dirección, si tiene a cappy y si está dañado
{
    if (this.swimming) //Animaciones cuando está nadando
        this.animations.play('swim' + dir + cappy + hurt);
    else if (this.body.onFloor()) //Animaciones cuando está en el suelo
    {
        if (this.throwTimer > this.game.time.totalElapsedSeconds()) //Animación de lanzamiento de Cappy
        {
            if (this.thrown)
                this.animations.play('throw' + dir);
        }
        else if (this.kicking) //Animación de patada
        {
            if (this.kickTimer > this.game.time.totalElapsedSeconds())
                this.animations.play('kick' + dir);
            else
                this.kicking = false;
        }
        else if (!this.moving && this.crouching) //Animación cuando está agachado
            this.animations.play('idleCrouch' + dir + cappy + hurt);
        else if (this.crouching && this.running) //Animaciones cuando está rodando
            this.animations.play('crouching' + dir + cappy + hurt);
        else if (this.crouching) //Animaciones cuando está moviendose agachado
            this.animations.play('crouch' + dir + cappy + hurt);
        else if (this.moving) //Animaciones cuando está andando
            this.animations.play('run' + dir + cappy + hurt);
        else //Animación cuando está quieto
            this.animations.play('idle' + dir + cappy + hurt);
    }
    else //Animaciones cuando está en el aire
    {
        if (this.bombJump) //Animación de salto bomba
            this.animations.play('bomb' + dir + cappy + hurt);
        else if (this.tackling) //Animación de impulso aereo
            this.animations.play('tackle' + dir + cappy + hurt);
        else if (this.throwTimer > this.game.time.totalElapsedSeconds()) {
            if (this.thrown) //Animación de lanzamiento de Cappy
                this.animations.play('throw' + dir);
        }
        else if (this.kicking) //Animación de patada
        {
            if (this.kickTimer > this.game.time.totalElapsedSeconds())
                this.animations.play('kick' + dir);
            else
                this.kicking = false;
        }
        else //Animación de salto
            this.animations.play('jump' + dir + cappy + hurt);
    }
}
//Animaciones
Mario.prototype.handleAnimations = function () {
    if (!this.capture) //Animaciones de Mario
    {
        if (this.facing == 1) //Animaciones derecha
        {
            if (!this.hurt) //Animaciones herido
            {
                if (!this.thrown)
                    this.MarioAnims('Right', '', '');
                else
                    this.MarioAnims('Right', 'Cappy', '');
            }
            else //Animaciones normal
            {
                if (!this.thrown)
                    this.MarioAnims('Right', '', 'Hurt');
                else
                    this.MarioAnims('Right', 'Cappy', 'Hurt');
            }
        }
        else //Animaciones izquierda
        {
            if (!this.hurt) //Animaciones herido
            {
                if (!this.thrown)
                    this.MarioAnims('Left', '', '');
                else
                    this.MarioAnims('Left', 'Cappy', '');
            }
            else //Animaciones normal
            {
                if (!this.thrown)
                    this.MarioAnims('Left', '', 'Hurt');
                else
                    this.MarioAnims('Left', 'Cappy', 'Hurt');
            }
        }
    }
    else //Animaciones de enemigo capturado
        this.enemy.handleAnimations(this);
}
//Recalcula la caja de colisiones de Mario
Mario.prototype.recalculateBody = function () {
    this.handleAnimations();
    this.enemy.Recalculate(this);
}

module.exports = Mario;
