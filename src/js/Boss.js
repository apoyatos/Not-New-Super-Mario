'use strict';

var Chomp = require('./Chomp.js')

function Boss(game, x, y, sprite, frame, chompSprite, speed, life, player) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    //Mario
    this.player = player;
    //Chomp
    this.chomp = new Chomp(this.game, this.x, this.y, chompSprite, 0, 50, 200, 300,0, this.player, 0);
    this.capture = false;
    //Movimiento
    this.speed = speed;
    //Vida y daño
    this.life = life;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    //Propiedades
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.gravity.y = 600;
    this.scale.setTo(3, 3);
    //Caja de colisión
    this.originalHeight = this.body.height * this.scale.x;
    this.animations.add('hurt', [1, 0], 5, true);
}
Boss.prototype = Object.create(Phaser.Sprite.prototype);
Boss.constructor = Boss;

//Movimiento del Boss
Boss.prototype.Move = function () {
    if (this.player.y < this.bottom) {

        if (this.chomp.captured && (this.player.x > this.x + this.speed + this.chomp.chain / 2 || this.player.x < this.x - this.speed - this.chomp.chain / 2))
            this.body.velocity.x = 0;
        else {
            this.chomp.originX = this.x;
            this.body.velocity.x = Math.sign(this.player.x - this.x) * this.speed;
        }

    }
    else
        this.body.velocity.x = 0;

}
//Cammbia la dirección
Boss.prototype.ChangeDir = function () {
    this.speed = -this.speed;
}
//Vidas y daño recibido
Boss.prototype.Hurt = function () {
    if (this.chomp.charged && this.game.physics.arcade.overlap(this.chomp, this)) //Si se choca con el chomp cargado
    {
        console.log(this.life)
        if (this.life > 1) //Su vida es 1 o más
        {
            if (!this.hurt) //Se hace daño
            {

                this.animations.play('hurt');
                this.life--;
                this.hurtTimer = this.hurtTime + this.game.time.totalElapsedSeconds()
                this.hurt = true;
            }
        }
        else //Se muere y desaparece junto al chomp
        {
            if (!this.hurt) {
                this.chomp.destroy();
                this.destroy();
            }
        }
    }
    if (this.alive && this.hurtTimer < this.game.time.totalElapsedSeconds())
        this.hurt = false;
}


module.exports = Boss;