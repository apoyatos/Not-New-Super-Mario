'use strict';

var Enemy = require('./Enemigo.js');
var Chomp = require('./Chomp.js');

function Boss(game, x, y, sprite, frame, chompSprite, speed, life, player, scene) {
    Enemy.call(this, game, x, y, sprite, frame);
    //Mario
    this.player = player;
    //Chomp
    this.chomp = new Chomp(this.game, this.x, this.y, chompSprite, 0, 50, 200, 300, 0, this.player, 0, this.player.chompBossAnims);
    this.capture = false;
    //Movimiento
    this.speed = speed;
    //Vida y daño
    this.life = life;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    //Propiedades
    this.scene = scene;
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 600;
    this.scale.setTo(1, 1);
    //Sonidos
    this.startBattle = false;
    this.musicOn = false;
    this.bossSound = this.game.add.audio('boss');
    this.bossSound.volume = 1;
    this.bossDeath = this.game.add.audio('bossDeath');
    this.bossDeath.volume = 1;
    //Animaciones
    this.animations.add('walkLeft', [0], 5, false);
    this.animations.add('walkRight', [1], 5, false);
    this.animations.add('hurtLeft', [0, 2], 5, true);
    this.animations.add('hurtRight', [1, 2], 5, true);
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
}
Boss.prototype = Object.create(Enemy.prototype);
Boss.constructor = Boss;

//Movimiento del Boss
Boss.prototype.Move = function () {
    if (this.startBattle && !this.musicOn) {
        //Cambia la música de fondo
        this.scene.levelSound.stop();
        this.scene.battleSound.play();
        this.scene.battleSound.loop = true;
        this.musicOn = true;
    }
    if (this.player.y < this.bottom) //Empieza a moverse cuando llega Mario
    {
        this.startBattle = true;
        //Si Mario ha capturado al chomp y está a más de la mitad de distancia de la cadena el Boss no se mueve
        if (this.chomp.captured && (this.player.x > this.x + this.speed + this.chomp.chain / 2 || this.player.x < this.x - this.speed - this.chomp.chain / 2))
            this.body.velocity.x = 0;
        else {
            this.chomp.originX = this.x;
            this.body.velocity.x = Math.sign(this.player.x - this.x) * this.speed;
            //Animaciones
            if (this.body.velocity.x < 0)
                this.animations.play('walkLeft');
            else
                this.animations.play('walkRight');
        }
    }
    else //Quieto
        this.body.velocity.x = 0;
}
//Vidas y daño recibido
Boss.prototype.Hurt = function () {
    if (this.chomp.charged && this.game.physics.arcade.overlap(this.chomp, this)) //Si se choca con Mario chomp
    {
        if (this.life > 1) //Su vida es 1 o más
        {
            if (!this.hurt) //Se hace daño
            {
                this.life--;
                this.hurtTimer = this.hurtTime + this.game.time.totalElapsedSeconds()
                this.hurt = true;
                this.bossSound.play();
                //Animaciones
                if (this.body.velocity.x < 0)
                    this.animations.play('hurtLeft');
                else
                    this.animations.play('hurtRight');
            }
        }
        else //Se muere y desaparece junto al chomp
        {
            if (!this.hurt) {
                this.chomp.kill();
                this.kill();
                //Pausa el juego y la música
                this.scene.pause = true;
                this.scene.battleSound.stop();
                //Sonido de la muerte del Boss
                this.bossDeath.play();
                this.bossDeath.onStop.add(Dead, this);
                //Reanuda el juego
                function Dead() {
                    this.scene.pause = false;
                    //Sonido de victoria
                    this.scene.winSound.play();
                }
                this.scene.winSound.onStop.add(Win, this);
                function Win() {
                    this.scene.win = true;
                }
            }
        }
    }
    if (this.alive && this.hurtTimer < this.game.time.totalElapsedSeconds())
        this.hurt = false;
}

module.exports = Boss;
