'use strict';

var Enemy = require('./Enemigo.js');

function Capturable(game, x, y, sprite, frame, speed, moving, shootingVel, shooting, type) {
    Enemy.call(this, game, x, y, sprite, frame, speed, moving, shootingVel, shooting);
    this.type = type; //0 goomba
}
Capturable.prototype = Object.create(Enemy.prototype);
Capturable.constructor = Capturable;

Capturable.prototype.Move = function (player) 
{
    switch(player.enemyType)
    {
        case(0):
            player.body.velocity.x = player._facing * player._velocity;
            break;
   }
}
Capturable.prototype.NotMoving = function (player) 
{
    switch(player.enemyType)
    {
        case(0):
            player.body.velocity.x = 0;
            break;
    }
}
Capturable.prototype.Jump = function (player) 
{
    switch(player.enemyType)
    {
        case(0):
        if(player.body.onFloor())
            player.body.velocity.y = -player._jumpVelocity / 2;
            break;
    } 
}

module.exports = Capturable;
