'use strict';
var Chomp = require('./Chomp.js')

function Boss(game, x, y, sprite, frame, chompSprite, speed, life, player) {
    Phaser.Sprite.call(this, game, x, y, sprite, frame);
    this.game.world.addChild(this);
    this.game.physics.arcade.enable(this);
    this.scale.setTo(4.25,4.5);
    this.body.gravity.y = 600;
    //Mario
    this.player = player;
    //Movimiento
    this.speed = speed;
    this.chomp = new Chomp(this.game, this.x, this.y, chompSprite, 0, 2 * this.speed, 100, 100, 1);
    this.life = life;
    //Sprites y animaciones
    this.scale.setTo(2, 2);
    //this.animations.add('walk', [0, 1], 5, true);
    this.originalHeight = this.body.height * this.scale.x;
}
Boss.prototype = Object.create(Phaser.Sprite.prototype);
Boss.constructor = Boss;

Boss.prototype.Move = function () {
    this.body.velocity.x = this.speed;
    this.chomp.originX=this.x;
}
Boss.prototype.ChangeDir = function () {
    this.speed = -this.speed;
}
Boss.prototype.Hurt = function () {
    if (this.chomp.charged && this.game.physics.arcade.overlap(this.player, this)) {
        if (this.life > 1)
            this.life--;
        else
            destroy(this);
    }
}

module.exports = Boss;