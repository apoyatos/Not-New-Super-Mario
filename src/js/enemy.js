'use strict';

function Enemy(game, x, y, sprite, frame, speed) {
  Phaser.Sprite.call(this, game, x, y, sprite, frame);

  this.game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.body.gravity.y = speed * 5;
}
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.constructor = Enemy;

Enemy.prototype.resizeMeUP = function (num) {
  this.width = this.width * num;
  this.height = this.height * num;
}
Enemy.prototype.resizeMeDOWN = function (num) {
  this.width = this.width / num;
  this.height = this.height / num;
}
Enemy.prototype.animAdd = function (name, frames, speed) {
  this.animations.add(name, frames, speed, true);
}
Enemy.prototype.update = function () {
  this.body.velocity.x = 0;

    if (this.game.input.keyboard.createCursorKeys().left.isDown)
    {
        this.body.velocity.x = -this.speed;
        this.animations.play('walk');
    }
    else if (this.game.input.keyboard.createCursorKeys().right.isDown)
    {
        this.body.velocity.x = this.speed;
        this.animations.play('walk');
    }
    else
    {
        this.animations.stop();
    }
}

module.exports = Enemy;
