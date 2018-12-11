'use strict';

function Cappy(game, x, y, name, player, dir) {
    Phaser.Sprite.call(this, game, x, y, name);
    //Mario
    this.player = player;
    //Movimiento
    this.dir = dir;
    this.velocity = 400;
    //Acciones
    this.cappyHold = false;
    this.cappyStopped = false;
    this.cappyReturning = false;
    this.cappyCapture = false;
    //Temporizadores
    this.cappyTime = 0.5;
    this.cappyTimer = 0;
    this.cappyHoldTime = 3;
    this.cappyHoldTimer = 0;
    this.cappyStopTime = 1;
    this.cappyStopTimer = 0;
    this.cappyCooldownTime = 1;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.allowGravity = false;
    //Sonidos
    this.throwSound = this.game.add.audio('throw');
    this.captureSound = this.game.add.audio('capture');
    //Sprite y animaciones
    this.scale.setTo(2, 2);
    this.animations.add("thrown", [0, 1, 2], 8, true);
}
Cappy.prototype = Object.create(Phaser.Sprite.prototype);
Cappy.constructor = Cappy;

//Movimiento al lanzarse
Cappy.prototype.Throw = function () {
    if (!this.cappyCapture && !this.player.capture) //Si es Mario
    {
        if (!this.player.thrown) {
            this.body.velocity.x = this.velocity * this.dir;
            this.animations.play("thrown");
            this.player.thrown = true;
            this.cappyHold = true;
            this.throwSound.play();
            this.cappyTimer = this.game.time.totalElapsedSeconds() + this.cappyTime;
        }
    }
}
//Manejo de lanzamiento
Cappy.prototype.Check = function () {
    if (this.player.thrown && !this.cappyStopped && !this.player.cappyPlant) //Si se ha lanzado y no se ha mantenido en su posición
    {
        if (this.game.time.totalElapsedSeconds() > this.cappyTimer) {
            this.body.velocity.x = 0;
            this.cappyStopped = true;
            this.cappyHoldTimer = this.game.time.totalElapsedSeconds() + this.cappyHoldTime;
            this.cappyStopTimer = this.game.time.totalElapsedSeconds() + this.cappyStopTime;
        }
    }
    else if (this.cappyStopped && !this.player.cappyPlant) //Tras mantenerse en su posición
    {
        if ((this.cappyHold && this.game.time.totalElapsedSeconds() > this.cappyHoldTimer) || (!this.cappyHold && this.game.time.totalElapsedSeconds() > this.cappyStopTimer)) {
            this.game.physics.arcade.moveToObject(this.player.cappy, this.player, 500);
            this.cappyReturning = true;
        }
    }
}
//Manejo de colisiones
Cappy.prototype.Collision = function () {
    if (this.game.physics.arcade.overlap(this.player.cappy, this.player) && this.cappyReturning) //Se reinicia al volver a Mario
    {
        this.Reset();
    }
    else if (this.game.physics.arcade.overlap(this.player.cappy, this.player) && this.cappyStopped) //Se reinicia después de que Mario salte sobre ella
    {
        this.player.body.velocity.y = -this.player.jumpVelocity / 1.5;
        this.player.tackling = false;
        this.player.tackles = 1;
        this.Reset();
    }
}
//Reinicia el estado de Cappy
Cappy.prototype.Reset = function () {
    this.player.cappyCooldownTimer = this.game.time.totalElapsedSeconds() + this.cappyCooldownTime;
    this.player.thrown = false;
    this.cappyStopped = false;
    this.cappyReturning = false;
    this.player.cappy.kill();
    if (this.throwSound.isPlaying)
        this.throwSound.stop();
}
//Captura al enemigo con Cappy
Cappy.prototype.Capture = function (enemy, scene) {
    if (this.game.physics.arcade.overlap(this.player.cappy, enemy)) {
        //Pausa la escena
        scene.pause = true;
        this.cappyCapture = true;
        this.player.capture = true;
        this.player.enemy = enemy;
        //Reproduce el sonido
        if (this.throwSound.isPlaying)
            this.throwSound.stop();

        this.captureSound.play();
        this.captureSound.onStop.add(ResetMario, this);
        function ResetMario() {
            enemy.kill();
            this.Reset();
            this.player.reset(enemy.body.position.x, enemy.body.position.y);
            this.player.recalculateBody();
            //Reanuda la escena
            scene.pause = false;
        }
        return true;
    }
    else
        return false;
}
//Bloquea a la Planta
Cappy.prototype.Stunn = function (enemy) {
    if (this.game.physics.arcade.overlap(this.player.cappy, enemy) && enemy.type == 'plant') {
        this.player.cappyPlant = true;
        this.player.cappy.kill();
        if (this.throwSound.isPlaying)
            this.throwSound.stop();
    }
}

module.exports = Cappy;
