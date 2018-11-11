'use strict';

var Enemy= require('./Enemigo.js');

function Capturable(game, x, y, sprite, frame, speed, moving,shootingVel, shooting,type)
{
    Enemy.call(this, game, x, y, sprite, frame,speed,moving,shootingVel,shooting);
    this.type =type; //0 goomba
}
Capturable.prototype=Object.create(Enemy.prototype);
Capturable.constructor=Capturable;

module.exports = Capturable;