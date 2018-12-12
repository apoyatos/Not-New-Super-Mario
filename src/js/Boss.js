'use strict';
var Chomp = require('./Chomp.js')

function Boss(game, x, y, sprite, frame, chompSprite, speed, life, player) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(4.25, 4.5);
    this.body.gravity.y = 600;
    //Mario
    this.player = player;
    //Movimiento
    this.speed = speed;
    this.chomp = new Chomp(this.game, this.x, this.y, chompSprite, 0, 2 * this.speed, 300, 200, 0,this.player);

    this.life = life;
    this.hurt = false;
    this.hurtTime = 1;
    this.hurtTimer = 0;
    this.capture = false;
    //Sprites y animaciones
    this.scale.setTo(2, 2);
    //this.animations.add('walk', [0, 1], 5, true);
    this.originalHeight = this.body.height * this.scale.x;
}
Boss.prototype = Object.create(Phaser.Sprite.prototype);
Boss.constructor = Boss;

Boss.prototype.Move = function () {
    if (!this.chomp.captured) {
        this.chomp.originX = this.x;
        this.body.velocity.x = Math.sign(this.player.x - this.x) * this.speed;
    }
    else
        this.body.velocity.x = Math.sign(this.player.x - this.x) * this.speed;;

}
Boss.prototype.ChangeDir = function () {
    this.speed = -this.speed;
}
Boss.prototype.Hurt = function () {
    if (this.chomp.charged && this.game.physics.arcade.overlap(this.chomp, this)) {
        if (this.life > 1) {
            console.log(this.hurt)
            if (!this.hurt) {
                this.life--;
                this.hurtTimer = this.hurtTime + this.game.time.totalElapsedSeconds()
                this.hurt = true;
                this.player.ThrowCappy();
            }
            else {
                if (this.hurtTimer < this.game.time.totalElapsedSeconds())
                    this.hurt = false;
            }

        }
        else {
            this.player.ThrowCappy();
            this.chomp.destroy();
            this.destroy();
        }
    }
}


module.exports = Boss;