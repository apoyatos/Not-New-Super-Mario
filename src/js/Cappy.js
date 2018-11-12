'use strict';

function Cappy(game, x, y, name, player, dir) {
    Phaser.Sprite.call(this, game, x, y, name);

    this._player = player;
    this._dir = dir;
    this._velocity = 400;

    this._cappyHold = false;
    this._cappyStopped = false;
    this._cappyReturning = false;
    this._cappyCapture = false;

    this._cappyTime = 0.5;
    this._cappyTimer = 0;

    this._cappyHoldTime = 3;
    this._cappyHoldTimer = 0;

    this._cappyStopTime = 1;
    this._cappyStopTimer = 0;

    this._cappyCooldownTime = 1;

    this.game.world.addChild(this);  
    this.game.physics.arcade.enable(this);
    this.body.allowGravity = false;

    this.scale.setTo(2, 2);
    this.animations.add("Thrown", [0, 1, 2], 8, true);
}
Cappy.prototype = Object.create(Phaser.Sprite.prototype);
Cappy.constructor = Cappy;

Cappy.prototype.Returning = function() {
    this.body.velocity.x =this._velocity * (this._dir * -1);
}
Cappy.prototype.Released = function() {
    this._cappyHold = false;
}
Cappy.prototype.Throw = function() {
    if(!this.cappyCapture && !this._player.capture)
    {
        if(!this._player._thrown)
        {
            this.body.velocity.x = this._velocity * this._dir;
            this.animations.play("Thrown");
            this._player._thrown = true;
            this._cappyHold = true;
            this._cappyTimer = this.game.time.totalElapsedSeconds() + this._cappyTime;
        }
    }
}
Cappy.prototype.Check = function() {
    if(this._player._thrown && !this._cappyStopped)
    {
        if(this.game.time.totalElapsedSeconds() > this._cappyTimer)
        {
            this.body.velocity.x = 0;
            this._cappyStopped = true;  
            this._cappyHoldTimer = this.game.time.totalElapsedSeconds() + this._cappyHoldTime;          
            this._cappyStopTimer = this.game.time.totalElapsedSeconds() + this._cappyStopTime;
        }
    }
    else if(this._cappyStopped)
    {
        if((this._cappyHold && this.game.time.totalElapsedSeconds() > this._cappyHoldTimer) || (!this._cappyHold && this.game.time.totalElapsedSeconds() > this._cappyStopTimer))
        {
            this.game.physics.arcade.moveToObject(this._player.cappy, this._player, 500);
            this._cappyReturning = true;
        }
    }
}
Cappy.prototype.Collision = function() {
    if(this.game.physics.arcade.overlap(this._player.cappy, this._player) && this._cappyReturning)
    {
        this.Reset();
    }
    else if(this.game.physics.arcade.overlap(this._player.cappy, this._player) && this._cappyStopped)
    { 
        this._player.body.velocity.y = -this._player._jumpVelocity;
        this._player._tackling = false;
        this._player._tackles = 1;
    }
}
Cappy.prototype.Reset = function() {
    this._player._cappyCooldownTimer = this.game.time.totalElapsedSeconds() + this._cappyCooldownTime;
    this._player._thrown = false;
    this._cappyStopped = false;
    this._cappyReturning = false;
    this._player.cappy.kill();
}
Cappy.prototype.Capture = function(enemy) {
    if(this.game.physics.arcade.overlap(this._player.cappy, enemy))
    {
        
        enemy.kill();
        this.cappyCapture = true;
        this._player.capture = true;
        this._player.enemyType = enemy.type;
        this._player.reset(enemy.body.position.x, enemy.body.position.y);
        this.Reset();
    }
}

module.exports = Cappy;
