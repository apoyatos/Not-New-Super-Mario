'use strict';

var Enemy = require('./Enemigo.js');

function Capturable(game, x, y, sprite, frame, speed, moving, shootingVel, shooting, type) {
    Enemy.call(this, game, x, y, sprite, frame, speed, moving, shootingVel, shooting);
    this.type = type; //0 goomba
}
Capturable.prototype = Object.create(Enemy.prototype);
Capturable.constructor = Capturable;

Capturable.prototype.MoveGoomba = function (player) {
    player.body.velocity.x = player._facing * player._velocity;
}
Capturable.prototype.NotMovingGoomba = function (player) {
    player.body.velocity.x = 0;
}
Capturable.prototype.JumpGoomba = function (player) {
    player.body.velocity.y = -player._jumpVelocity / 2;
}

module.exports = Capturable;
